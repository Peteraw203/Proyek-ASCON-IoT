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
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item pc-cart-menu">
        <Dropdown align="end">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0">
            <i className="ph-duotone ph-bell"></i>
            <span className="badge bg-danger pc-h-badge">3</span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="pc-h-dropdown dropdown-notification">
            <Dropdown.Header className="d-flex align-items-center justify-content-between">
              <h5 className="m-0">Notifications</h5>
              <div className="ms-auto">
                <button className="btn btn-sm btn-link-secondary">Read all</button>
              </div>
            </Dropdown.Header>
            <SimpleBar style={{ maxHeight: 'calc(100vh - 185px)' }}>
              <div className="dropdown-body text-wrap header-notification-scroll position-relative">
                <ul className="list-group list-group-flush w-100">
                  {notifications.map((item, index) => (
                    <li key={index} className={`${item.messageRead === true ? '' : 'unread'} list-group-item `}>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 position-relative">
                          {item.avatar ? (
                            <img src={item.avatar} alt="user-avatar" className="user-avatar avatar avatar-s" />
                          ) : (
                            <div className={`avatar avatar-s ${item.background}`}>
                              {' '}
                              <i className={`${item.icon} f-18`} />
                            </div>
                          )}
                          {item.messageRead ? (
                            ''
                          ) : (
                            <div className="position-absolute top-50 end-100 translate-middle-y pe-2">
                              <i className="fas fa-circle text-success"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <div className="d-flex">
                            <div className="flex-grow-1 me-3 position-relative">
                              <h6 className="mb-0 text-truncate">{item.title}</h6>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="text-sm text-muted">{item.time}</span>
                            </div>
                          </div>
                          <p className="position-relative text-muted mt-1 mb-2">
                            <br />
                            <span className="text-truncate">{item.message}</span>
                          </p>
                          {item.badge && (
                            <span className="badge rounded-pill bg-light-warning border border-warning me-1 mt-1">{item.badge}</span>
                          )}
                          {item.buttons &&
                            item.buttons.map((btn, index) => (
                              <button key={index} className={`btn btn-sm ${btn.variant} me-2`}>
                                {btn.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </SimpleBar>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown align="end">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link pc-head-link-text arrow-none me-0 user-name">
            <img src={avatar2} alt="user-image" className="user-avatar" />
            <span>
              <span className="user-name">Joseph William</span>
              <span className="user-desc">Administrator</span>
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
                        <h5 className="mb-0">Carson Darrin</h5>
                        <a className="text-sm link-secondary" href="mailto:carson.darrin@company.io">
                          carson.darrin@company.io
                        </a>
                      </div>
                      <span className="badge bg-primary">PRO</span>
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
