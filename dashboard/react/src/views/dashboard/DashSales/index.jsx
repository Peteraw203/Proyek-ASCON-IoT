import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import mqtt from 'mqtt';
import { Ascon } from 'ascon-js';

// --- KONFIGURASI MQTT ---
const MQTT_BROKER = 'ws://broker.hivemq.com:8000/mqtt';
const MQTT_TOPIC = 'water-ascon128';

// --- KUNCI ASCON ---
const KEY_BYTES = new TextEncoder().encode("asconciphertest1");
const NONCE_BYTES = new TextEncoder().encode("asconcipher1test");
const AD_BYTES = new TextEncoder().encode("ASCON");

export default function DashSales() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [rawLogs, setRawLogs] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const terminalEndRef = useRef(null);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawLogs]);

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

        // Simpan log data mentah
        const timestamp = new Date().toLocaleTimeString();
        const newLog = `[${timestamp}] ${jsonData.data}`;

        setRawLogs(prev => {
          const newLogs = [...prev, newLog];
          if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100); // Keep last 100 lines
          return newLogs;
        });

        // Dekripsi data Hex yang diterima
        const realValue = decryptAscon(jsonData.data);

        setCurrentLevel(realValue);

        // Update History
        setHistoryData(prev => {
          const newData = [...prev, { x: new Date().getTime(), y: realValue }];
          // Batasi history agar tidak terlalu berat (misal 50 data terakhir)
          if (newData.length > 50) return newData.slice(newData.length - 50);
          return newData;
        });

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

  // --- KONFIGURASI CHART ---
  const chartOptions = {
    chart: {
      id: 'realtime',
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Water Level History',
      align: 'left'
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'datetime',
      range: 20000, // Tampilkan jendela waktu 20 detik terakhir (opsional, sesuaikan)
    },
    yaxis: {
      max: 100,
      min: 0
    },
    legend: {
      show: false
    },
  };

  const chartSeries = [{
    name: "Water Level",
    data: historyData
  }];

  return (
    <Row>
      {/* --- LIVE WATER LEVEL (FULL WIDTH) --- */}
      <Col md={12} xl={12}>
        <Card
          className="text-center shadow-sm"
          style={{
            backgroundColor: cardBgColor,
            transition: 'all 0.5s ease',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h4 style={{ color: textColor, fontWeight: '600', marginBottom: '20px' }}>
              <i className="feather icon-activity me-2"></i>
              Live Water Level
            </h4>

            {/* Angka Besar */}
            <h1 style={{
              fontSize: '5rem',
              fontWeight: 'bold',
              color: textColor,
              margin: '0'
            }}>
              {currentLevel}%
            </h1>

            {/* Status Text */}
            <div style={{ marginTop: '15px' }}>
              <span className={`badge ${isDanger ? 'bg-danger' : 'bg-success'}`} style={{ fontSize: '1rem', padding: '10px 20px' }}>
                {isDanger ? 'BAHAYA: AIR PENUH!' : 'AMAN: LEVEL NORMAL'}
              </span>
            </div>

            <small style={{ color: textColor, opacity: 0.8, marginTop: '20px', fontStyle: 'italic' }}>
              Encrypted via ASCON-128
            </small>
          </Card.Body>
        </Card>
      </Col>

      {/* --- RAW DATA & CHART --- */}
      <Col md={12} xl={12}>
        <Row>
          {/* RAW DATA TERMINAL */}
          <Col md={12} xl={4}>
            <Card>
              <Card.Header>
                <h5>Raw Encrypted Data Log</h5>
              </Card.Header>
              <Card.Body style={{ padding: '0' }}>
                <div style={{
                  backgroundColor: '#1e1e1e',
                  color: '#00ff00',
                  padding: '15px',
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontSize: '0.85rem',
                  height: '380px',
                  overflowY: 'auto',
                  borderBottomLeftRadius: '4px',
                  borderBottomRightRadius: '4px'
                }}>
                  {rawLogs.length === 0 && <div style={{ opacity: 0.5 }}>Waiting for data...</div>}
                  {rawLogs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '5px', wordBreak: 'break-all' }}>
                      <span style={{ color: '#888', marginRight: '10px' }}>$</span>
                      {log}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* HISTORY CHART */}
          <Col md={12} xl={8}>
            <Card>
              <Card.Body>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height={350}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}