# Water Level MQTT ASCON-128 Subscriber (OLED + WiFi Manager)
import binascii
import time
import ujson
import machine
import ssd1306
import wifimgr   
import ascon    
from umqtt.simple import MQTTClient
import network

I2C_SDA = 20
I2C_SCL = 21
OLED_WIDTH = 128
OLED_HEIGHT = 64

MQTT_CLIENT_ID = "esp32-sub-oled-001"
MQTT_BROKER    = "broker.hivemq.com"
MQTT_USER      = ""
MQTT_PASSWORD  = ""
MQTT_TOPIC     = "water-ascon128"

WIFI_SSID = "Lantai 2" 
WIFI_PASS = "1234567890"

key   = "asconciphertest1".encode('utf-8')
nonce = "asconcipher1test".encode('utf-8')
associateddata = b"ASCON"
variant = "Ascon-128"

print("Inisialisasi OLED...", end="")
try:
    i2c = machine.I2C(0, scl=machine.Pin(I2C_SCL), sda=machine.Pin(I2C_SDA))
    oled = ssd1306.SSD1306_I2C(OLED_WIDTH, OLED_HEIGHT, i2c)
    oled.fill(0)
    oled.text("System Boot...", 0, 0)
    oled.show()
    print("OK")
except Exception as e:
    print(f"\nError OLED: {e}")
    # Buat objek dummy agar program tidak crash jika OLED error
    class DummyOLED:
        def fill(self,c): pass
        def text(self,t,x,y): pass
        def show(self): pass
        def hline(self,x,y,w,c): pass
        def rect(self,x,y,w,h,c): pass
        def fill_rect(self,x,y,w,h,c): pass
    oled = DummyOLED()

# --- FUNGSI UPDATE TAMPILAN OLED ---
def update_oled(status_text, level=None, warning_text=None):
    oled.fill(0) # Bersihkan layar
    
    # Header
    oled.text("WATER MONITOR", 12, 0)
    oled.hline(0, 10, 128, 1) # Garis pemisah
    
    if level is not None:
        # Tampilkan teks persen besar (simulasi)
        oled.text(f"Level: {level}%", 10, 15)
        
        # Gambar Bar Chart (Visualisasi Air)
        # Kotak bingkai
        oled.rect(14, 30, 100, 12, 1) 
        # Isi kotak sesuai persentase (max width 100px)
        if level > 100: level = 100
        bar_fill = int((level / 100) * 100)
        oled.fill_rect(14, 30, bar_fill, 12, 1) 
        
    # Area Status / Warning (Baris bawah)
    if warning_text:
        oled.text(warning_text, 5, 50)
    elif status_text:
        oled.text(status_text, 5, 50)
        
    oled.show()


update_oled("Connecting WiFi..")
print("Menginisialisasi WiFi via wifimgr...")

#try:
   # wlan = wifimgr.get_connection()
    #if wlan is None:
     #   print("Gagal konek WiFi.")
      #  update_oled("WiFi Fail!")
       # while True: pass 
#except Exception as e:
 #   print(f"Error WiFiMgr: {e}")

#print("WiFi Terhubung!")
#update_oled("WiFi OK!", level=0)
#time.sleep(1)

sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
sta_if.connect(WIFI_SSID, WIFI_PASS)

timeout = 0
while not sta_if.isconnected():
    time.sleep(0.5)
    print(".", end="")
    timeout += 1
    if timeout > 20: # Timeout 10 detik
        print("\nGagal Konek WiFi!")
        update_oled("WiFi Failed!")
        break
print(" Connected!")
update_oled("WiFi Connected!")


def sub_cb(topic, msg):
    print(f"Pesan dari {topic}: ", end="")
    try:
        # Parsing JSON
        v = ujson.loads(msg)
        encrypted_hex = v['data']
        
        # 1. Dekripsi Data (ASCON)
        try:
            decrypted_bytes = ascon.demo_aead_p(variant, binascii.unhexlify(encrypted_hex), k=key, n=nonce, a=associateddata)
        except Exception as e:
            print(f"Gagal Decrypt: {e}")
            decrypted_bytes = None

        if decrypted_bytes is None:
            print("Isi pesan tidak valid / Salah Kunci!")
            update_oled("Bad Encrypt!", level=0, warning_text="KEY ERROR")
        else:
            # 2. Convert Bytes kembali ke Integer
            # Publisher mengirim dengan: .to_bytes(1, 'big')
            level_persen = int.from_bytes(decrypted_bytes, 'big')
            
            # 3. Logika Warning
            warning_msg = ""
            if level_persen < 15:
                warning_msg = "!! LOW WATER !!"
                print(f"{level_persen}% -> WARNING: AIR SEDIKIT")
            elif level_persen > 90:
                warning_msg = "!! FULL TANK !!"
                print(f"{level_persen}% -> WARNING: AIR PENUH")
            else:
                warning_msg = "Normal"
                print(f"{level_persen}%")
            
            # 4. Update OLED
            update_oled("Data OK", level=level_persen, warning_text=warning_msg if warning_msg != "Normal" else None)

    except Exception as e:
        print(f"Error parsing: {e}")
        update_oled("Data Error")

# --- SETUP MQTT ---
print("Menghubungkan ke Broker MQTT...", end="")
update_oled("Connect Broker..")
client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, user=MQTT_USER, password=MQTT_PASSWORD)
client.set_callback(sub_cb)

while True:
    try:
        client.connect()
        client.subscribe(MQTT_TOPIC)
        print(" Berhasil!")
        update_oled("Waiting Data...", level=0)
        
        # Loop utama menunggu pesan
        while True:
            client.check_msg()
            time.sleep(0.1)
            
    except OSError as e:
        print(f"Koneksi Putus: {e}. Reconnecting in 5s...")
        update_oled("Lost Connect!", warning_text="Reconnecting...")
        time.sleep(5)
        # Reset machine jika stuck parah (opsional)
        # machine.reset()