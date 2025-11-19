#Weather MQTT ASCON-128 Subscriber
import binascii
import ascon
import network
import time
from machine import Pin
import dht
import ujson
from umqtt.simple import MQTTClient

# MQTT Server Parameters
MQTT_CLIENT_ID = "micropython-dht-sub"
MQTT_BROKER    = "broker.hivemq.com"
MQTT_USER      = ""
MQTT_PASSWORD  = ""
MQTT_TOPIC     = "dht-ascon128"

print("Connecting to WiFi", end="")
sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
sta_if.connect('Wokwi-GUEST', '')
while not sta_if.isconnected():
  print(".", end="")
  time.sleep(0.1)
print(" Connected!")

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

def sub_cb(topic, msg):
  v = ujson.loads(msg)
  p_temp = ascon.demo_aead_p(t, binascii.unhexlify(v['temp']), k=key, n=nonce, a=associateddata)
  p_humi = ascon.demo_aead_p(t, binascii.unhexlify(v['humidity']), k=key, n=nonce, a=associateddata)
  #print(msg)
  print("Updated!")
  print("Subscribe ke MQTT topic {}: {}".format(MQTT_TOPIC, v))
  print("temp: {}".format(p_temp.decode()))
  print("humi: {}".format(p_humi.decode()))

client.set_callback(sub_cb)
client.subscribe(MQTT_TOPIC, qos=0)

while True:
  client.check_msg()
  time.sleep(1)