import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

// Menggunakan logo yang sama dengan template
import logoDark from '../../assets/images/logo-dark.svg';

const Register = () => {
  const navigate = useNavigate();

  // State untuk menyimpan input user (Nama dihapus)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk tampilan (Loading & Error)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi yang dijalankan saat tombol Sign Up diklik
  const handleRegister = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setError('');
    setLoading(true);

    // Validasi sederhana
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      // 1. Buat akun di Firebase Authentication (Hanya Email & Password)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Registrasi berhasil:", user);
      
      // 2. Redirect otomatis ke halaman Dashboard setelah sukses
      navigate('/dashboard/sales');

    } catch (err) {
      console.error("Error Register:", err);
      // Menampilkan pesan error yang jelas
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar. Silakan login.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError('Gagal daftar: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                {/* Logo */}
                <img src={logoDark} alt="Logo" className="img-fluid mb-4" />
                <h4 className="mb-3 f-w-400">Sign up</h4>

                {/* Alert Error jika ada masalah */}
                {error && <div className="alert alert-danger text-start">{error}</div>}

                <form onSubmit={handleRegister}>
                  {/* Input Email */}
                  <div className="input-group mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Input Password */}
                  <div className="input-group mb-4">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Tombol Submit */}
                  <button 
                    className="btn btn-primary btn-block mb-4"
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Sign up'}
                  </button>
                </form>

                <p className="mb-2">
                  Already have an account?{' '}
                  <Link to="/login" className="f-w-400">
                    Signin
                  </Link>
                </p>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Register;