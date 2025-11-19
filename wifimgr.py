import network
import socket
import uos
import time
import machine
import select
import gc

AP_SSID = "ESP32-Config"
AP_PASSWORD = "" 
CONFIG_FILE = 'wifi.dat'

# --- FUNGSI DECODE URL (PENTING UNTUK SPASI) ---
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
            packet = data[:2] + b'\x81\x80' + data[4:6] + data[4:6] + b'\x00\x00\x00\x00' + data[12:] + \
                     b'\xc0\x0c\x00\x01\x00\x01\x00\x00\x00\x3c\x00\x04' + \
                     bytes(map(int, self.ip.split('.')))
            self.sock.sendto(packet, addr)
        except Exception:
            pass

def do_connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    if not CONFIG_FILE in uos.listdir():
        print("! Config WiFi tidak ditemukan.")
        return False
    
    f = open(CONFIG_FILE, 'r')
    wifi_data = f.read().split('\n')
    f.close()
    
    if len(wifi_data) < 2: return False

    # .strip() disini SUDAH BENAR (membersihkan saat membaca)
    ssid = wifi_data[0].strip()
    password = wifi_data[1].strip()
    
    print(f"Mencoba connect ke: '{ssid}'...")
    wlan.connect(ssid, password)
    
    # Tunggu koneksi (Maksimal 10 detik)
    for i in range(20): 
        if wlan.isconnected():
            print(f"Terhubung! IP: {wlan.ifconfig()[0]}")
            return True
        time.sleep(0.5)
        print(".", end="")
    
    print("\nGagal connect (Timeout/Password Salah).")
    return False

def start_ap():
    print("\n--- MEMULAI MODE PORTAL CONFIG ---")
    print("1. Connect ke WiFi: " + AP_SSID)
    print("2. Browser akan otomatis terbuka (atau buka 192.168.4.1)")
    
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '192.168.4.1'))
    ap.config(essid=AP_SSID, password=AP_PASSWORD)

    dns_srv = DNSServer()
    http_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    http_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    http_sock.bind(('0.0.0.0', 80))
    http_sock.listen(1)
    http_sock.setblocking(False)

    poller = select.poll()
    poller.register(dns_srv.sock, select.POLLIN)
    poller.register(http_sock, select.POLLIN)

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
                    
                    ssid_start = req.find('ssid=')
                    pass_start = req.find('password=')
                    
                    if ssid_start > 0 and pass_start > 0:
                        end_ssid = req.find('&', ssid_start)
                        if end_ssid == -1: end_ssid = len(req)
                        raw_ssid = req[ssid_start+5 : end_ssid]
                        
                        end_pass = req.find(' ', pass_start)
                        if end_pass == -1: end_pass = len(req)
                        raw_pass = req[pass_start+9 : end_pass]
                        
                        # --- PERBAIKAN UTAMA DISINI ---
                        # Tambahkan .strip() agar spasi di awal/akhir input browser DIBUANG
                        ssid_val = unquote(raw_ssid).strip()
                        pass_val = unquote(raw_pass).strip()
                        
                        print(f"Menyimpan: '{ssid_val}' / '{pass_val}'")
                        f = open(CONFIG_FILE, 'w')
                        f.write(f"{ssid_val}\n{pass_val}")
                        f.close()
                        
                        conn.send('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<h1>Tersimpan! Restarting...</h1>')
                        conn.close()
                        time.sleep(2)
                        machine.reset()
                    else:
                        html = """HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n
                        <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>body{font-family:sans-serif;text-align:center;padding:20px}input{padding:10px;width:90%;margin:5px}</style>
                        </head><body><h2>WiFi Setup</h2><form action="/" method="POST">
                        <input type="text" name="ssid" placeholder="SSID" required><br>
                        <input type="text" name="password" placeholder="Password"><br>
                        <input type="submit" value="Save"></form></body></html>"""
                        conn.send(html)
                        conn.close()
                except:
                    try: conn.close()
                    except: pass
        gc.collect()

def get_connection():
    # LOGIKA UTAMA:
    # 1. Coba Connect.
    # 2. Jika Gagal (Return False) -> Langsung Start AP.
    if do_connect():
        return True
    else:
        print("Koneksi gagal. Membuka portal config...")
        start_ap() # Ini akan looping selamanya sampai user save & restart
        return False