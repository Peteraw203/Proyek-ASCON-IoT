# Water Level MQTT ASCON-128 Subscriber (Persentase)
import binascii
import ascon
import network
import time
import ujson
from umqtt.simple import MQTTClient

# Konfigurasi
MQTT_CLIENT_ID = "pc-water-sub"
MQTT_BROKER    = "broker.hivemq.com"
MQTT_TOPIC     = "water-ascon128"

# Setup WiFi 
print("Connecting to WiFi", end="")
sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
sta_if.connect('Wokwi-GUEST', '')
while not sta_if.isconnected():
  time.sleep(0.1)
print(" Connected!")

client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER)
client.connect()
print(f"Listening on {MQTT_TOPIC}")

key   = "asconciphertest1".encode('utf-8')
nonce = "asconcipher1test".encode('utf-8')
associateddata = b"ASCON"
variant = "Ascon-128"

def sub_cb(topic, msg):
  try:
      v = ujson.loads(msg)
      encrypted_hex = v['data']
      
      # 1. Dekripsi
      decrypted_bytes = ascon.demo_aead_p(variant, binascii.unhexlify(encrypted_hex), k=key, n=nonce, a=associateddata)
      
      if decrypted_bytes is None:
          print("Gagal Dekripsi!")
      else:
          # 2. Ubah Bytes kembali ke Integer
          level_persen = int.from_bytes(decrypted_bytes, 'big')
          
          # Tampilkan Hasil
          print(f"Status Air: {level_persen}%")
          
          # Logika tambahan untuk warning
          if level_persen < 10:
              print(">> WARNING: AIR HABIS!")
          elif level_persen > 90:
              print(">> WARNING: AIR PENUH!")

  except Exception as e:
      print(f"Error: {e}")

client.set_callback(sub_cb)
client.subscribe(MQTT_TOPIC)

while True:
  client.check_msg()
  time.sleep(0.5)