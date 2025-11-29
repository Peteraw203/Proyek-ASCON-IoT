# Subscriber.py (Versi Laptop/PC - Fixed)
import paho.mqtt.client as mqtt
import json  
import binascii
import time
import sys

try:
    import ascon 
except ImportError:
    print("Error: File 'ascon.py' tidak ditemukan di folder ini!")
    sys.exit(1)

MQTT_CLIENT_ID = "pc-subscriber-unique-001" 
MQTT_BROKER    = "broker.hivemq.com"
MQTT_USER      = ""
MQTT_PASSWORD  = ""
MQTT_TOPIC     = "water-ascon128" 

# Key & Nonce (Harus sama persis dengan ESP32)
key   = "asconciphertest1".encode('utf-8')
nonce = "asconcipher1test".encode('utf-8')
associateddata = b"ASCON"
variant = "Ascon-128"

# Callback saat terkoneksi
def on_connect(client, userdata, flags, rc, properties=None):
    # Note: Parameter 'properties' ditambahkan untuk kompatibilitas Paho v2
    if rc == 0:
        print(f"Berhasil connect ke Broker! (Return Code: {rc})")
        client.subscribe(MQTT_TOPIC)
        print(f"Mendengarkan topik: {MQTT_TOPIC}")
    else:
        print(f"Gagal connect, return code: {rc}")

# Callback saat pesan diterima
def on_message(client, userdata, msg):
    try:
        print("\n" + "="*30)
        print(f"Pesan masuk dari topik: {msg.topic}")
        
        payload_str = msg.payload.decode('utf-8')
        # print(f"Raw JSON: {payload_str}") # Uncomment untuk debug
        
        v = json.loads(payload_str)
        encrypted_hex = v['data']
        print(f"Data Terenkripsi (Hex): {encrypted_hex}")

        # Proses Dekripsi
        # Pastikan fungsi demo_aead_p di ascon.py sudah support parameter k,n,a
        decrypted_bytes = ascon.demo_aead_p(variant, binascii.unhexlify(encrypted_hex), k=key, n=nonce, a=associateddata)

        if decrypted_bytes:
            # Ubah Bytes kembali ke Integer
            level_persen = int.from_bytes(decrypted_bytes, 'big')
            print(f"Status Air: {level_persen}%")
            
            # Logika Alert
            if level_persen < 10: 
                print(">> ⚠️  WARNING: AIR HABIS! ⚠️ <<")
            elif level_persen > 90: 
                print(">> ⚠️  WARNING: AIR PENUH! ⚠️ <<")
            else:
                print(">> Status Aman.")
        else:
            print("❌ Gagal Dekripsi (Key/Nonce salah atau Data rusak)")

    except Exception as e:
        print(f"Error memproses pesan: {e}")

# --- SETUP CLIENT (Support Paho v1 & v2) ---
print("Menyiapkan Client...")

# Cek versi Paho MQTT yang terinstall untuk menentukan cara inisialisasi
try:
    # Cara baru (Paho v2.x)
    from paho.mqtt.enums import CallbackAPIVersion
    client = mqtt.Client(CallbackAPIVersion.VERSION2, MQTT_CLIENT_ID)
except ImportError:
    # Cara lama (Paho v1.x)
    print("Mendeteksi Paho MQTT versi lama (v1.x)")
    client = mqtt.Client(MQTT_CLIENT_ID)

# Set User/Pass (Kosongkan jika public broker)
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)

# Assign Callbacks
client.on_connect = on_connect
client.on_message = on_message

# Connect
print(f"Menghubungkan ke {MQTT_BROKER}...")
try:
    client.connect(MQTT_BROKER, 1883, 60)
    # Loop selamanya (Blocking) agar script tidak mati
    client.loop_forever()
except Exception as e:
    print(f"Gagal melakukan koneksi awal: {e}")