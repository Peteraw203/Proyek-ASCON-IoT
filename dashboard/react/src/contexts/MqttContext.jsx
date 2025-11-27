import React, { createContext, useContext, useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MqttContext = createContext(null);

export const useMqtt = () => useContext(MqttContext);

const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';

export const MqttProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
      console.log('Connected to HiveMQ!');
      setConnectionStatus('Connected');
    });

    mqttClient.on('reconnect', () => {
      console.log('Reconnecting to HiveMQ...');
      setConnectionStatus('Connecting');
    });

    mqttClient.on('close', () => {
      console.log('Disconnected from HiveMQ');
      setConnectionStatus('Disconnected');
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
      setConnectionStatus('Disconnected');
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  return (
    <MqttContext.Provider value={{ client, connectionStatus }}>
      {children}
    </MqttContext.Provider>
  );
};
