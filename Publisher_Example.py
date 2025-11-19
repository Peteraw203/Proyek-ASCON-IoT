#DHT MQTT ASCON-128 Publisher
"""
"""
import binascii
import ascon
import network
import time
from machine import Pin
import dht
import ujson
from umqtt.simple import MQTTClient

# MQTT Server Parameters
MQTT_CLIENT_ID = "micropython-dht-demo"
MQTT_BROKER    = "broker.hivemq.com"
MQTT_USER      = ""
MQTT_PASSWORD  = ""
MQTT_TOPIC     = "dht-ascon128"

sensor = dht.DHT22(Pin(15))

print("Connect ke WiFi", end="")
sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
sta_if.connect('Wokwi-GUEST', '')
while not sta_if.isconnected():
  print(".", end="")
  time.sleep(0.1)
print("Terhubung")

print("Terhubung ke MQTT server... ", end="")
client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, user=MQTT_USER, password=MQTT_PASSWORD)
client.connect()

print("Terhubung")

key   = "asconciphertest1".encode('utf-8')
print(len(key))
nonce = "asconcipher1test".encode('utf-8')
print(len(nonce))
associateddata = b"ASCON"
t="Ascon-128"

while True:
  print("Sensor DHT ")
  sensor.measure() 
  print("temp: "+str(sensor.temperature()))
  print("humi: "+str(sensor.humidity()))
  #enkripsi
  temp_ae = ascon.demo_aead_c(t, sensor.temperature(), k=key, n=nonce, a=associateddata)
  humidity_ae = ascon.demo_aead_c(t, sensor.humidity(), k=key, n=nonce, a=associateddata)
  #bytes to hex
  temp_hex = binascii.hexlify(temp_ae)
  humidity_hex = binascii.hexlify(humidity_ae)

  message = ujson.dumps({
    "temp": temp_hex,
    "humidity": humidity_hex,
  })
  print("Terupdate")
  print("Report ke MQTT topic {}: {}".format(MQTT_TOPIC, message))
  client.publish(MQTT_TOPIC, message)

  #test dekripsi
  #p_temp = ascon.demo_aead_p("Ascon-128", binascii.unhexlify(temp_hex))
  #p_humi = ascon.demo_aead_p("Ascon-128", binascii.unhexlify(humidity_hex))
  #print(p_temp.decode())
  #print(p_humi.decode())
  time.sleep(1)
