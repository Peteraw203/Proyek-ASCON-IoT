import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer" style={{ padding: '50px 0', background: 'transparent' }}>
        <Container fluid>
          <Row>
            {/* Copyright Kiri */}
            <Col md={6} sm={12}>
              <p className="mb-0 text-muted">
                Copyright &copy; {new Date().getFullYear()} 
                   &nbsp; 
              </p>
            </Col>
            <Col md={6} sm={12} className="text-md-end">
               {/* Area Kosong */}
            </Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;