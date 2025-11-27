// react-bootstrap
import { ListGroup, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// third party
import SimpleBar from 'simplebar-react';

// project import
import ActionItem from './ActionItem';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

// firebase
import { signOut } from 'firebase/auth';
import { auth } from 'config/firebase';
import { useAuth } from 'contexts/AuthContext';

import { useMqtt } from 'contexts/MqttContext';

// notifications data
const notifications = [];

// profile dropdown item
const profile = [];

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { connectionStatus } = useMqtt();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <div className="d-flex align-items-center me-3">
          <span className={`badge ${connectionStatus === 'Connected' ? 'bg-success' : 'bg-danger'}`}>
            {connectionStatus}
          </span>
        </div>
      </ListGroup.Item>
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown align="end">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link pc-head-link-text arrow-none me-0 user-name">
            <img src={avatar2} alt="user-image" className="user-avatar" />
            <span>
              <span className="user-name">{currentUser?.email?.split('@')[0] || 'User'}</span>
              <span className="user-desc">Admin</span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="pc-h-dropdown dropdown-user-profile">
            <Dropdown.Header className="r d-flex align-items-center justify-content-between">
              <h5 className="m-0">Profile</h5>
            </Dropdown.Header>
            <SimpleBar style={{ maxHeight: 'calc(100vh - 225px)' }}>
              <div className="dropdown-body profile-notification-scroll">
                <ul className="list-group list-group-flush w-100">
                  <li className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <img src={avatar2} alt="user" className="wid-50 rounded-circle" />
                      </div>
                      <div className="flex-grow-1 mx-3">
                        <h5 className="mb-0">{currentUser?.email?.split('@')[0] || 'User'}</h5>
                        <a className="text-sm link-secondary" href="#">
                          {currentUser?.email || 'No Email'}
                        </a>
                      </div>
                      <span className="badge bg-primary">ACTIVE</span>
                    </div>
                  </li>
                  <li className="list-group-item">
                    <button className="btn btn-danger w-100" onClick={handleLogout}>
                      <i className="feather icon-log-out me-2" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            </SimpleBar>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
