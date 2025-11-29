import network
import socket
import uos
import time
import machine
import select
import gc

# Konfigurasi AP
AP_SSID = "ESP32-Config"
AP_PASSWORD = ""  
CONFIG_FILE = 'wifi.dat'

def unquote(string):
    if not string: return ""
    string = string.replace('+', ' ')
    parts = string.split('%')
    if len(parts) == 1: return string
    res = parts[0]
    for part in parts[1:]:
        try:
            res += chr(int(part[:2], 16)) + part[2:]
        except:
            res += '%' + part
    return res

class DNSServer:
    def __init__(self):
        self.ip = '192.168.4.1'
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(('', 53))
        self.sock.setblocking(False)

    def handle(self):
        try:
            data, addr = self.sock.recvfrom(1024)
            # Respon DNS spoofing (mengarahkan semua domain ke 192.168.4.1)
            packet = data[:2] + b'\x81\x80' + data[4:6] + data[4:6] + b'\x00\x00\x00\x00' + data[12:] + \
                     b'\xc0\x0c\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04' + \
                     bytes(map(int, self.ip.split('.')))
            self.sock.sendto(packet, addr)
        except Exception:
            pass

def do_connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.disconnect()
    time.sleep(1)

    # Cek apakah file config ada
    try:
        if CONFIG_FILE not in uos.listdir():
            print("! Config WiFi tidak ditemukan.")
            return False
        
        f = open(CONFIG_FILE, 'r')
        wifi_data = f.read().split('\n')
        f.close()
    except:
        return False
    
    if len(wifi_data) < 2: return False

    ssid = wifi_data[0].strip()
    password = wifi_data[1].strip()
    
    print(f"Mencoba connect ke: '{ssid}'...")
    
    wlan.connect(ssid, password)
    max_wait = 15
    while max_wait > 0:
        if wlan.isconnected():
            print(f"\nTerhubung! IP: {wlan.ifconfig()[0]}")
            return True
        time.sleep(1)
        max_wait -= 1
        print(".", end="")
    
    print("\nGagal connect (Timeout).")
    return False

def start_ap():
    print(f"\n--- MEMULAI MODE PORTAL CONFIG ---")
    
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    time.sleep(1) # Beri jeda agar radio hardware siap
    
    try:
        ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '192.168.4.1'))
    except:
        print("Gagal set IP static, menggunakan default.")

    # Konfigurasi Security AP
    print(f"Mengaktifkan WiFi: {AP_SSID}")
    if AP_PASSWORD:
        # Jika ada password, pakai WPA2 (authmode=3)
        ap.config(essid=AP_SSID, password=AP_PASSWORD, authmode=3)
    else:
        # Jika password kosong, pakai OPEN (authmode=0)
        ap.config(essid=AP_SSID, authmode=0)
    
    print(f"AP Siap! Silakan connect ke '{AP_SSID}'")
    print("Browser akan otomatis terbuka (Captive Portal) atau buka 192.168.4.1")

    # Jalankan DNS Server & Web Server
    dns_srv = DNSServer()
    http_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    http_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    http_sock.bind(('0.0.0.0', 80))
    http_sock.listen(1)
    http_sock.setblocking(False)

    poller = select.poll()
    poller.register(dns_srv.sock, select.POLLIN)
    poller.register(http_sock, select.POLLIN)

    print("Menunggu user...")

    while True:
        responses = poller.poll(100)
        for sock, _ in responses:
            if sock == dns_srv.sock:
                dns_srv.handle()
            elif sock == http_sock:
                try:
                    conn, addr = http_sock.accept()
                    conn.settimeout(3.0)
                    raw = conn.recv(1024)
                    try: req = raw.decode('utf-8')
                    except: req = str(raw)
                    
                    # Routing sederhana
                    ssid_start = req.find('ssid=')
                    pass_start = req.find('password=')
                    
                    if ssid_start > 0 and pass_start > 0:
                        # --- PROSES SIMPAN CONFIG ---
                        end_ssid = req.find('&', ssid_start)
                        if end_ssid == -1: end_ssid = len(req)
                        raw_ssid = req[ssid_start+5 : end_ssid]
                        
                        end_pass = req.find(' ', pass_start)
                        if end_pass == -1: end_pass = len(req)
                        raw_pass = req[pass_start+9 : end_pass]
                        
                        ssid_val = unquote(raw_ssid).strip()
                        pass_val = unquote(raw_pass).strip()
                        
                        print(f"Menyimpan Config: SSID='{ssid_val}'")
                        f = open(CONFIG_FILE, 'w')
                        f.write(f"{ssid_val}\n{pass_val}")
                        f.close()
                        
                        conn.send('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<h1>Tersimpan! Restarting...</h1>')
                        conn.close()
                        time.sleep(2)
                        machine.reset()

                    elif 'GET /marin.jpg' in req:
                        # --- KIRIM GAMBAR ---
                        try:
                            conn.send('HTTP/1.1 200 OK\r\nContent-Type: image/jpeg\r\n\r\n')
                            with open('marin.jpg', 'rb') as img_f:
                                while True:
                                    chunk = img_f.read(1024)
                                    if not chunk: break
                                    conn.send(chunk)
                        except: pass
                        conn.close()

                    else:
                        # --- TAMPILKAN HALAMAN UTAMA ---
                        html = """HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n
                        <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>body{font-family:sans-serif;text-align:center;padding:20px}
                        input{padding:10px;width:90%;margin:5px;box-sizing:border-box}
                        img{max-width:100%;margin-top:20px;border-radius:10px}
                        button{padding:10px 20px;background:blue;color:white;border:none;border-radius:5px;margin-top:10px}</style>
                        </head><body>
                        <h2>WiFi Setup</h2>
                        <form action="/" method="POST">
                        <input type="text" name="ssid" placeholder="SSID" required><br>
                        <input type="text" name="password" placeholder="Password"><br>
                        <button type="submit">Connect</button>
                        </form>
                        <br>
                        <img src="marin.jpg" alt="Marin Kitagawa">
                        </body></html>"""
                        conn.send(html)
                        conn.close()

                except Exception as e:
                    print("Socket Error:", e)
                    try: conn.close()
                    except: pass
        gc.collect()

def get_connection():
    if do_connect():
        return True
    else:
        start_ap()
        return False