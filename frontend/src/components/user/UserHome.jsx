import React, { useEffect, useState } from 'react'
import { Badge, Row } from 'antd';
import Notification from '../common/Notification';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicationIcon from '@mui/icons-material/Medication';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Container, Form, Button, Alert } from 'react-bootstrap';

import ApplyDoctor from './ApplyDoctor';
import UserAppointments from './UserAppointments';
import DoctorList from './DoctorList';

const UserHome = () => {
   const [doctors, setDoctors] = useState([])
   const [userdata, setUserData] = useState({})
   const [activeMenuItem, setActiveMenuItem] = useState('');

   // Search & filter
   const [search, setSearch] = useState('');
   const [specialization, setSpecialization] = useState('');
   const [specializations, setSpecializations] = useState([]);

   const getUser = () => {
      const user = JSON.parse(localStorage.getItem('userData'))
      if (user) {
         setUserData(user)
      }
   }

   // Ambil data user terbaru dari server (supaya notifikasi selalu update)
   const getUserData = async () => {
      try {
         const res = await axios.post('http://localhost:8001/api/user/getuserdata', {}, {
            headers: {
               Authorization: "Bearer " + localStorage.getItem('token')
            },
         });
         if (res.data.success) {
            const freshUser = { ...res.data.data };
            delete freshUser.password;
            setUserData(freshUser);
            localStorage.setItem('userData', JSON.stringify(freshUser));
         }
      } catch (error) {
         console.log(error);
      }
   };

   const getDoctorData = async (filters = {}) => {
      try {
         const res = await axios.get('http://localhost:8001/api/user/getalldoctorsu', {
            headers: {
               Authorization: "Bearer " + localStorage.getItem('token')
            },
            params: filters,
         });
         if (res.data.success) {
            setDoctors(res.data.data)
            // Simpan daftar spesialisasi dari data tanpa filter
            if (!filters.search && !filters.specialization) {
               const list = [...new Set(res.data.data.map((d) => d.specialization))];
               setSpecializations(list);
            }
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      getUser();
      getUserData();
      getDoctorData()
   }, []);

   const handleFilter = (e) => {
      e.preventDefault();
      getDoctorData({ search, specialization });
   };

   const handleReset = () => {
      setSearch('');
      setSpecialization('');
      getDoctorData();
   };

   const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      window.location.href = "/";
   };

   const handleMenuItemClick = (menuItem) => {
      setActiveMenuItem(menuItem);
      getUserData(); // refresh notifikasi setiap pindah menu
   };

   return (
      <>
         <div className='main'>
            <div className="layout">
               <div className="sidebar">
                  <div className="logo">
                     <h2>MediConnect</h2>
                  </div>
                  <div className="menu">
                     <div className={`menu-items ${activeMenuItem === '' ? 'active' : ''}`} onClick={() => handleMenuItemClick('')}>
                        <CalendarMonthIcon className='icon' /><Link>Home</Link>
                     </div>
                     <div className={`menu-items ${activeMenuItem === 'userappointments' ? 'active' : ''}`} onClick={() => handleMenuItemClick('userappointments')}>
                        <CalendarMonthIcon className='icon' /><Link>Appointments</Link>
                     </div>
                     {userdata.isdoctor === true ? <></> : <div className={`menu-items ${activeMenuItem === 'applyDoctor' ? 'active' : ''}`} onClick={() => handleMenuItemClick('applyDoctor')}>
                        <MedicationIcon className='icon' /><Link>Apply doctor</Link>
                     </div>}

                     <div className="menu-items" onClick={logout}>
                        <LogoutIcon className='icon' /><Link>Logout</Link>
                     </div>
                  </div>
               </div>
               <div className="content">
                  <div className="header">
                     <div className="header-content">
                        <Badge className={`notify ${activeMenuItem === 'notification' ? 'active' : ''}`} onClick={() => handleMenuItemClick('notification')} count={userdata?.notification ? userdata.notification.length : 0}>
                           <NotificationsIcon className="icon" />
                        </Badge>

                        {userdata.isdoctor === true && <h3>Dr. </h3>}
                        <h3>{userdata.fullName}</h3>
                     </div>
                  </div>
                  <div className="body">
                     {activeMenuItem === 'applyDoctor' && <ApplyDoctor userId={userdata._id} />}
                     {activeMenuItem === 'notification' && <Notification />}
                     {activeMenuItem === 'userappointments' && <UserAppointments />}
                     {activeMenuItem !== 'applyDoctor' && activeMenuItem !== 'notification' && activeMenuItem !== 'userappointments' && <Container>
                        <h2 className="text-center p-2">Home</h2>

                        {userdata.isdoctor === true ? (
                           <Alert variant="info" className="text-center">
                              Welcome, Dr. {userdata.fullName}! Open the <b>Appointments</b> menu to manage your patients.
                           </Alert>
                        ) : (
                           <>
                              {/* Search & Filter */}
                              <Form onSubmit={handleFilter} className="d-flex flex-wrap gap-2 mb-3">
                                 <Form.Control
                                    style={{ maxWidth: '280px' }}
                                    type="text"
                                    placeholder="Search by name or location"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                 />
                                 <Form.Select
                                    style={{ maxWidth: '240px' }}
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                 >
                                    <option value="">All Specializations</option>
                                    {specializations.map((spec) => (
                                       <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                 </Form.Select>
                                 <Button type="submit">Search</Button>
                                 <Button variant="secondary" onClick={handleReset}>Reset</Button>
                              </Form>

                              {doctors.length === 0 ? (
                                 <Alert variant="warning">No doctors found.</Alert>
                              ) : (
                                 <Row>
                                    {doctors.map((doctor, i) => (
                                       <DoctorList userDoctorId={doctor.userId} doctor={doctor} userdata={userdata} key={i} />
                                    ))}
                                 </Row>
                              )}
                           </>
                        )}
                     </Container>}
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default UserHome;