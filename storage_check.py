import uos
import sys
try:
    s = uos.statvfs('/')
    b_size = s[0]
    f_blocks = s[3]
    a_blocks = s[2] 
    
    print("--- INFO STORAGE ESP32 ---")
    print(f"Total File System: {a_blocks * b_size / 1024 / 1024:.2f} MB")
    print(f"Ruang Kosong: {f_blocks * b_size / 1024 / 1024:.2f} MB")
    print("----------------------------")
except Exception as e:
    print(f"Gagal membaca storage: {e}")
    
sys.exit() 