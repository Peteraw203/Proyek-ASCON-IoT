import { useContext } from 'react';

// react-bootstrap
import { ListGroup, Dropdown } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';

// project import
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';

// -----------------------|| NAV LEFT ||-----------------------//

export default function NavLeft() {
  const configContext = useContext(ConfigContext);
  const { sidebarHide } = configContext.state;
  const { dispatch } = configContext;
  const sidebarToggle = () => {
    dispatch({ type: actionType.SIDEBAR_HIDE, sidebarHide: !sidebarHide });
  };

  if (sidebarHide) {
    document.querySelector('.pc-sidebar')?.classList.add('pc-sidebar-hide');
  } else {
    document.querySelector('.pc-sidebar')?.classList.remove('pc-sidebar-hide');
  }

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" className="pc-h-item" id="desktop-collapse" onClick={sidebarToggle}>
        <div className="pc-head-link">
          <i className="ti ti-menu-2 f-24"></i>
        </div>
      </ListGroup.Item>
      <ListGroup.Item as="li" className="pc-h-item" id="mobile-collapse" onClick={navToggleHandler}>
        <div className="pc-head-link">
          <i className="ti ti-menu-2 f-24"></i>
        </div>
      </ListGroup.Item>

    </ListGroup>
  );
}
