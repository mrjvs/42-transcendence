import React from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../hooks/useUser';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import './UserDropdown.css';

// TODO logout
export function UserDropdown() {
  const [open, setOpen] = React.useState(false);
  const userData = React.useContext(UserContext);

  return (
    <div className={'userDropdown ' + (open ? 'open' : '')}>
      <div className="cont" onClick={() => setOpen((p) => !p)}>
        <Avatar user={userData?.user} />
        <div className="name">
          <p>{userData?.user?.name || 'Unknown user'}</p>
          <Icon className="icon" type="chevron" />
        </div>
      </div>
      <div className="overlay" onClick={() => setOpen(false)} />
      <div className="menu">
        <Link to="/settings" className="menuItem">
          User settings
        </Link>
        <a className="menuItem">Logout</a>
      </div>
    </div>
  );
}
