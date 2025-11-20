// react-bootstrap
import { ListGroup, Dropdown } from 'react-bootstrap';

// third party
import SimpleBar from 'simplebar-react';

// project import
import ActionItem from './ActionItem';

// assets
import avatar1 from 'assets/images/user/avatar-1.jpg';
import avatar2 from 'assets/images/user/avatar-2.jpg';
import avatar3 from 'assets/images/user/avatar-3.jpg';

// notifications data
const notifications = [
  {

  }
];

// profile dropdown item
const profile = [
  [

  ]
];

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown align="end">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link pc-head-link-text arrow-none me-0 user-name">
            <img src={avatar2} alt="user-image" className="user-avatar" />
            <span>
              <span className="user-name">Sensor Gedung F</span>
              <span className="user-desc">Monitoring</span>
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
                        <h5 className="mb-0">Sensor Gedung F</h5>
                        <a className="text-sm link-secondary" href="#">
                          sensor.f@ascon.iot
                        </a>
                      </div>
                      <span className="badge bg-primary">ACTIVE</span>
                    </div>
                  </li>
                  {profile.map((group, groupIdx) => (
                    <li className="list-group-item item-actions" key={groupIdx}>
                      {group.map((item, idx) => (
                        <ActionItem key={idx} item={item} />
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </SimpleBar>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
