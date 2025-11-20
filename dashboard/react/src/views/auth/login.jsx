import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase'; // Import auth dari file config yang sudah kita buat

// Komponen Breadcrumb bawaan template (Opsional, biarkan jika ada error hapus saja)
import Breadcrumb from '../../layouts/AdminLayout/Breadcrumb';

const Login = () => {
  const navigate = useNavigate();
  
  // State untuk form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk UI (Error, Loading, Mode Reset)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); // Toggle antara Login vs Lupa Password
  const [resetMessage, setResetMessage] = useState('');

  // --- FUNGSI 1: LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Jika sukses, redirect ke dashboard
      navigate('/dashboard/sales');
    } catch (err) {
      // Handle error Firebase
      console.error(err);
      if (err.code === 'auth/user-not-found') setError('Email tidak terdaftar.');
      else if (err.code === 'auth/wrong-password') setError('Password salah.');
      else if (err.code === 'auth/invalid-email') setError('Format email salah.');
      else setError('Gagal login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI 2: FORGOT PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (!email) {
      setError('Harap masukkan email Anda terlebih dahulu.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Email reset password telah dikirim! Cek inbox/spam Anda.');
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim email reset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div>
          <Card className="borderless">
            <Row className="align-items-center text-center">
              <Col>
                <Card.Body className="card-body">
                  <div className="mb-4">
                    <i className="feather icon-unlock auth-icon" />
                  </div>
                  
                  {/* JUDUL HALAMAN */}
                  <h3 className="mb-4">
                    {isResetMode ? 'Reset Password' : 'Login Dashboard'}
                  </h3>

                  {/* ALERT ERROR & SUKSES */}
                  {error && <div className="alert alert-danger text-start">{error}</div>}
                  {resetMessage && <div className="alert alert-success text-start">{resetMessage}</div>}

                  {/* FORM */}
                  <form onSubmit={isResetMode ? handleResetPassword : handleLogin}>
                    
                    {/* INPUT EMAIL */}
                    <div className="input-group mb-3">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* INPUT PASSWORD (Hanya muncul di mode Login) */}
                    {!isResetMode && (
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
                    )}

                    {/* CHECKBOX REMEMBER ME (Hiasan saja untuk sekarang) */}
                    {!isResetMode && (
                      <div className="form-check text-start mb-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="flexCheckDefault"
                        />
                        <label className="form-check-label" htmlFor="flexCheckDefault">
                          Ingat Saya
                        </label>
                      </div>
                    )}

                    {/* TOMBOL UTAMA */}
                    <button 
                      className="btn btn-primary btn-block mb-4" 
                      disabled={loading}
                    >
                      {loading ? 'Memproses...' : (isResetMode ? 'Kirim Link Reset' : 'Sign In')}
                    </button>

                  </form>

                  {/* TOMBOL GANTI MODE (Login <-> Reset) */}
                  {!isResetMode ? (
                    <p className="mb-2 text-muted">
                      Lupa password?{' '}
                      <span 
                        onClick={() => setIsResetMode(true)} 
                        className="f-w-400" 
                        style={{cursor: 'pointer', color: '#04a9f5'}}
                      >
                        Reset Disini
                      </span>
                    </p>
                  ) : (
                    <p className="mb-2 text-muted">
                      Sudah ingat?{' '}
                      <span 
                        onClick={() => { setIsResetMode(false); setError(''); setResetMessage(''); }} 
                        className="f-w-400" 
                        style={{cursor: 'pointer', color: '#04a9f5'}}
                      >
                        Kembali ke Login
                      </span>
                    </p>
                  )}

                  {/* LINK KE REGISTER */}
                  <p className="mb-0 text-muted">
                    Belum punya akun?{' '}
                    <Link to="/register" className="f-w-400">
                      Sign Up
                    </Link>
                  </p>

                </Card.Body>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Login;