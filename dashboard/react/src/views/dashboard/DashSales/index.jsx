import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import mqtt from 'mqtt';
import { Ascon } from 'ascon-js';

// Charts Data
import { SalesAccountChartData } from './chart/sales-account-chart';

// --- KONFIGURASI MQTT ---
const MQTT_BROKER = 'ws://broker.hivemq.com:8000/mqtt';
const MQTT_TOPIC = 'water-ascon128';

// --- KUNCI ASCON ---
const KEY_BYTES = new TextEncoder().encode("asconciphertest1");
const NONCE_BYTES = new TextEncoder().encode("asconcipher1test");
const AD_BYTES = new TextEncoder().encode("ASCON");

export default function DashSales() {
  const [currentLevel, setCurrentLevel] = useState(0);

  // --- FUNGSI DEKRIPSI ---
  const decryptAscon = (hexString) => {
    try {
      if (!hexString) return 0;

      const match = hexString.match(/.{1,2}/g);
      if (!match) return 0;
      const ciphertext = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

      const decrypted = Ascon.decrypt(
        KEY_BYTES, 
        NONCE_BYTES, 
        ciphertext, 
        {
            variant: "Ascon-128", 
            associatedData: AD_BYTES 
        }
      );

      if (decrypted && decrypted.length > 0) {
          return decrypted[0]; 
      }
      return 0;
    } catch (e) {
      console.error("Gagal Dekripsi:", e);
      return 0;
    }
  };

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
      console.log('Connected to HiveMQ!');
      client.subscribe(MQTT_TOPIC);
    });

    client.on('message', (topic, message) => {
      try {
        const payloadStr = message.toString();
        const jsonData = JSON.parse(payloadStr);
        
        // Dekripsi data Hex yang diterima
        const realValue = decryptAscon(jsonData.data);
        
        setCurrentLevel(realValue);
      } catch (e) {
        console.log("Format pesan salah");
      }
    });

    return () => {
      if (client) client.end();
    };
  }, []);

  // --- LOGIKA TAMPILAN (WARNA) ---
  const isDanger = currentLevel > 90;
  const cardBgColor = isDanger ? '#f8d7da' : '#d4edda'; 
  const textColor = isDanger ? '#721c24' : '#155724';

  return (
    <Row>
      {/* --- SALES CHART (KIRI) --- */}
      <Col md={12} xl={6}>
        <Card>
          <Card.Header>
            <h5>Department wise monthly sales report</h5>
          </Card.Header>
          <Card.Body>
            <Row className="pb-2">
              <div className="col-auto m-b-10">
                <h3 className="mb-1">$21,356.46</h3>
                <span>Total Sales</span>
              </div>
              <div className="col-auto m-b-10">
                <h3 className="mb-1">$1935.6</h3>
                <span>Average</span>
              </div>
            </Row>
            <Chart {...SalesAccountChartData()} />
          </Card.Body>
        </Card>
      </Col>

      {/* --- LIVE WATER LEVEL (KANAN) --- */}
      <Col md={12} xl={6}>
        <Card 
            className="text-center shadow-sm" 
            style={{ 
                backgroundColor: cardBgColor, 
                transition: 'all 0.5s ease',
                minHeight: '430px', // Sesuaikan tinggi agar sama dengan grafik kiri
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
          <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h4 style={{ color: textColor, fontWeight: '600', marginBottom: '30px' }}>
              <i className="feather icon-activity me-2"></i> 
              Live Water Level
            </h4>
            
            {/* Angka Besar */}
            <h1 style={{ 
                fontSize: '6rem', 
                fontWeight: 'bold', 
                color: textColor,
                margin: '0'
            }}>
                {currentLevel}%
            </h1>

            {/* Status Text */}
            <div style={{ marginTop: '20px' }}>
                <span className={`badge ${isDanger ? 'bg-danger' : 'bg-success'}`} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                    {isDanger ? 'BAHAYA: AIR PENUH!' : 'AMAN: LEVEL NORMAL'}
                </span>
            </div>
            
            <small style={{ color: textColor, opacity: 0.8, marginTop: '40px', fontStyle: 'italic' }}>
              Encrypted via ASCON-128
            </small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}