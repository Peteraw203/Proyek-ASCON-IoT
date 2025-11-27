import binascii
import ascon
import time
import machine
from machine import Pin, ADC
import ujson
from umqtt.simple import MQTTClient
import wifimgr

# KONFIGURASI 
MQTT_CLIENT_ID = "esp32-water-890"
MQTT_USER      = ""
MQTT_PASSWORD  = ""
MQTT_BROKER    = "broker.hivemq.com"
MQTT_TOPIC     = "water-ascon128"

# KALIBRASI SENSOR 
WATER_THRESHOLD = 2200 

# Setup Sensor
sensor_pin = ADC(Pin(34))
sensor_pin.atten(ADC.ATTN_11DB) 

# SETUP WIFI MANAGER 
print("Menginisialisasi WiFi...")

#connection() akan mencoba connect.
# Jika GAGAL/SALAH PASSWORD, dia otomatis masuk mode AP di dalamnya.
# Jadi kalau kode ini lanjut ke bawah, berarti sudah terkoneksi.
wifimgr.get_connection()

print("WiFi Terhubung!")

#SETUP MQTT 
print("Menghubungkan ke Broker MQTT...", end="")
client = None
try:
    client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, user=MQTT_USER, password=MQTT_PASSWORD)
    client.connect()
    print(" Berhasil!")
except OSError as e:
    print(f"\nGagal connect MQTT: {e}")
    print("Mencoba lagi nanti...")

# enkripsi
key   = "asconciphertest1".encode('utf-8')
nonce = "asconcipher1test".encode('utf-8')
associateddata = b"ASCON"
variant ="Ascon-128"

while True:
  try:
      if client:
          try:
              raw_value = sensor_pin.read()
              persentase = (raw_value / WATER_THRESHOLD) * 100
              if persentase > 100: persentase = 100
              persentase_int = int(persentase)
              
              print(f"Raw: {raw_value} | Level: {persentase_int}%")

              payload_bytes = persentase_int.to_bytes(1, 'big')
              encrypted_data = ascon.demo_aead_c(variant, payload_bytes, k=key, n=nonce, a=associateddata)
              
              payload_hex = binascii.hexlify(encrypted_data).decode('utf-8')
              message = ujson.dumps({"data": payload_hex})

              client.publish(MQTT_TOPIC, message)
          
          except OSError:
              print("MQTT putus. Reconnecting...")
              try: client.connect()
              except: pass
      else:
          try:
              client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, user=MQTT_USER, password=MQTT_PASSWORD)
              client.connect()
          except: pass

  except Exception as e:
      print(f"Error: {e}")

  time.sleep(2)