import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import { Container, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { message } from 'antd';

const API = 'http://localhost:8001/api/admin';

const authHeader = () => ({
   Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const statusColors = {
   pending: 'warning',
   approved: 'success',
   rejected: 'danger',
};

const AdminDoctors = () => {
   const [doctors, setDoctors] = useState([]);

   const getDoctors = async () => {
      try {
         const res = await axios.get(`${API}/getalldoctors`, { headers: authHeader() });
         if (res.data.success) {
            setDoctors(res.data.data);
         }
      } catch (error) {
         console.log(error);
         message.error('Failed to load doctors');
      }
   };

   const updateStatus = async (doctor, status) => {
      const endpoint = status === 'approved' ? 'getapprove' : 'getreject';
      try {
         const res = await axios.post(
            `${API}/${endpoint}`,
            { doctorId: doctor._id, status, userid: doctor.userId },
            { headers: authHeader() }
         );
         if (res.data.success) {
            message.success(`Dr. ${doctor.fullName} has been ${status}`);
            getDoctors();
         }
      } catch (error) {
         console.log(error);
         message.error(error.response?.data?.message || 'Something went wrong');
      }
   };

   useEffect(() => {
      getDoctors();
   }, []);

   return (
      <div>
         <h2 className='p-3 text-center'>All Doctors</h2>
         <Container>
            <Table striped bordered hover responsive>
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Email</th>
                     <th>Phone</th>
                     <th>Specialization</th>
                     <th>Experience</th>
                     <th>Status</th>
                     <th>Action</th>
                  </tr>
               </thead>
               <tbody>
                  {doctors.length > 0 ? (
                     doctors.map((doctor) => (
                        <tr key={doctor._id}>
                           <td>{doctor.fullName}</td>
                           <td>{doctor.email}</td>
                           <td>{doctor.phone}</td>
                           <td>{doctor.specialization}</td>
                           <td>{doctor.experience} yrs</td>
                           <td>
                              <Badge bg={statusColors[doctor.status] || 'secondary'} className="text-capitalize">
                                 {doctor.status}
                              </Badge>
                           </td>
                           <td>
                              <div className="d-flex gap-1">
                                 {doctor.status !== 'approved' && (
                                    <Button size="sm" variant="success" onClick={() => updateStatus(doctor, 'approved')}>
                                       Approve
                                    </Button>
                                 )}
                                 {doctor.status !== 'rejected' && (
                                    <Button size="sm" variant="danger" onClick={() => updateStatus(doctor, 'rejected')}>
                                       Reject
                                    </Button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={7}>
                           <Alert variant="info" className="mb-0">
                              <Alert.Heading>No Doctors to show</Alert.Heading>
                           </Alert>
                        </td>
                     </tr>
                  )}
               </tbody>
            </Table>
         </Container>
      </div>
   );
};

export default AdminDoctors;