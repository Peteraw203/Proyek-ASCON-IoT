import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import { Ascon } from 'ascon-js';
import { useMqtt } from 'contexts/MqttContext';

// --- KONFIGURASI MQTT ---
const MQTT_TOPIC = 'water-ascon128';

// --- KUNCI ASCON ---
const KEY_BYTES = new TextEncoder().encode("asconciphertest1");
const NONCE_BYTES = new TextEncoder().encode("asconcipher1test");
const AD_BYTES = new TextEncoder().encode("ASCON");

export default function DashSales() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [encTime, setEncTime] = useState(0);
  const [decTime, setDecTime] = useState(0);
  const [rawLogs, setRawLogs] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [timeHistory, setTimeHistory] = useState([]); // { x: time, y1: enc, y2: dec }
  const terminalContainerRef = useRef(null);
  const { client } = useMqtt();

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
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
    if (!client) return;

    if (client.connected) {
      client.subscribe(MQTT_TOPIC);
    }

    const onConnect = () => {
      client.subscribe(MQTT_TOPIC);
    };
    client.on('connect', onConnect);

    const onMessage = (topic, message) => {
      if (topic !== MQTT_TOPIC) return;

      try {
        const payloadStr = message.toString();
        const jsonData = JSON.parse(payloadStr);

        // Simpan log data mentah
        const timestamp = new Date().toLocaleTimeString();
        const newLog = `[${timestamp}] ${jsonData.data}`;

        setRawLogs(prev => {
          const newLogs = [...prev, newLog];
          if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100);
          return newLogs;
        });

        // Ambil waktu enkripsi dari payload (jika ada)
        const encryptionDuration = jsonData.enc_time ? parseFloat(jsonData.enc_time) : 0;
        setEncTime(encryptionDuration);

        // Mulai hitung waktu dekripsi
        const startDecrypt = performance.now();

        // Dekripsi data Hex yang diterima
        const realValue = decryptAscon(jsonData.data);

        const endDecrypt = performance.now();
        const decryptionDuration = (endDecrypt - startDecrypt) / 1000.0; // convert to seconds
        setDecTime(decryptionDuration);

        setCurrentLevel(realValue);

        const now = new Date().getTime();

        // Update History Water Level
        setHistoryData(prev => {
          const newData = [...prev, { x: now, y: realValue }];
          if (newData.length > 50) return newData.slice(newData.length - 50);
          return newData;
        });

        // Update History Waktu Enkripsi/Dekripsi
        setTimeHistory(prev => {
          const newData = [...prev, { x: now, enc: encryptionDuration, dec: decryptionDuration }];
          if (newData.length > 50) return newData.slice(newData.length - 50);
          return newData;
        });

      } catch (e) {
        console.log("Format pesan salah");
      }
    };

    client.on('message', onMessage);

    return () => {
      client.off('message', onMessage);
      client.off('connect', onConnect);
      if (client.connected) {
        client.unsubscribe(MQTT_TOPIC);
      }
    };
  }, [client]);

  // --- LOGIKA TAMPILAN (WARNA) ---
  const isDanger = currentLevel > 90;
  const cardBgColor = isDanger ? '#f8d7da' : '#d4edda';
  const textColor = isDanger ? '#721c24' : '#155724';

  // --- KONFIGURASI CHART WATER LEVEL ---
  const waterChartOptions = {
    chart: {
      id: 'water-level',
      type: 'line',
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    title: { text: 'Water Level History', align: 'left' },
    xaxis: { type: 'datetime', range: 20000 },
    yaxis: { max: 100, min: 0 },
    legend: { show: false },
  };

  const waterChartSeries = [{ name: "Water Level", data: historyData }];

  // --- KONFIGURASI CHART WAKTU ---
  const timeChartOptions = {
    chart: {
      id: 'time-metrics',
      type: 'line',
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } },
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    title: { text: 'Encryption vs Decryption Time (s)', align: 'left' },
    xaxis: { type: 'datetime', range: 20000 },
    yaxis: {
      labels: { formatter: (val) => val.toFixed(4) }
    },
    colors: ['#008FFB', '#00E396'],
    legend: { show: true, position: 'top' },
  };

  const timeChartSeries = [
    { name: "Encryption Time", data: timeHistory.map(d => ({ x: d.x, y: d.enc })) },
    { name: "Decryption Time", data: timeHistory.map(d => ({ x: d.x, y: d.dec })) }
  ];

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
            <h1 style={{ fontSize: '5rem', fontWeight: 'bold', color: textColor, margin: '0' }}>
              {currentLevel}%
            </h1>
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

      {/* --- METRICS CARDS --- */}
      <Col md={6} xl={6}>
        <Card>
          <Card.Body className="text-center">
            <h6 className="mb-4">Encryption Time (ESP32)</h6>
            <h3 className="mb-0 text-primary">{encTime.toFixed(4)} s</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} xl={6}>
        <Card>
          <Card.Body className="text-center">
            <h6 className="mb-4">Decryption Time (Browser)</h6>
            <h3 className="mb-0 text-success">{decTime.toFixed(4)} s</h3>
          </Card.Body>
        </Card>
      </Col>

      {/* --- RAW DATA & CHARTS --- */}
      <Col md={12} xl={12}>
        <Row>
          {/* RAW DATA TERMINAL */}
          <Col md={12} xl={4}>
            <Card>
              <Card.Header>
                <h5>Raw Encrypted Data Log</h5>
              </Card.Header>
              <Card.Body style={{ padding: '0' }}>
                <div
                  ref={terminalContainerRef}
                  style={{
                    backgroundColor: '#1e1e1e',
                    color: '#00ff00',
                    padding: '15px',
                    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                    fontSize: '0.85rem',
                    height: '380px',
                    overflowY: 'auto',
                    borderBottomLeftRadius: '4px',
                    borderBottomRightRadius: '4px'
                  }}
                >
                  {rawLogs.length === 0 && <div style={{ opacity: 0.5 }}>Waiting for data...</div>}
                  {rawLogs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '5px', wordBreak: 'break-all' }}>
                      <span style={{ color: '#888', marginRight: '10px' }}>$</span>
                      {log}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* CHARTS */}
          <Col md={12} xl={8}>
            <Row>
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Chart options={waterChartOptions} series={waterChartSeries} type="line" height={250} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Chart options={timeChartOptions} series={timeChartSeries} type="line" height={250} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}