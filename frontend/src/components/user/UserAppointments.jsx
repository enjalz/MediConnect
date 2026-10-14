import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { Container, Button, Badge, Form } from 'react-bootstrap';
import axios from 'axios';
import { message } from 'antd';

const API = 'http://localhost:8001/api';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const statusColors = {
  pending: 'warning',
  approved: 'primary',
  completed: 'success',
  rejected: 'danger',
  cancelled: 'secondary',
};

// Batas minimal tanggal = sekarang (waktu lokal)
const getMinDateTime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const showError = (error) => {
  console.log(error);
  message.error(error.response?.data?.message || 'Something went wrong');
};

const StatusBadge = ({ status }) => (
  <Badge bg={statusColors[status] || 'dark'} className="text-capitalize">
    {status}
  </Badge>
);

const UserAppointments = () => {
  const [isDoctor, setIsDoctor] = useState(null);
  const [userAppointments, setUserAppointments] = useState([]);
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  // Modal: 'reschedule' | 'complete' | 'summary'
  const [modal, setModal] = useState('');
  const [selected, setSelected] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [visitSummary, setVisitSummary] = useState('');
  const [prescription, setPrescription] = useState('');

  const getUserAppointment = async () => {
    try {
      const res = await axios.get(`${API}/user/getuserappointments`, {
        headers: authHeader(),
      });
      if (res.data.success) setUserAppointments(res.data.data);
    } catch (error) {
      showError(error);
    }
  };

  const getDoctorAppointment = async () => {
    try {
      const res = await axios.get(`${API}/doctor/getdoctorappointments`, {
        headers: authHeader(),
      });
      if (res.data.success) setDoctorAppointments(res.data.data);
    } catch (error) {
      showError(error);
    }
  };

  const refresh = () => (isDoctor ? getDoctorAppointment() : getUserAppointment());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData'));
    setIsDoctor(user?.isdoctor === true);
  }, []);

  useEffect(() => {
    if (isDoctor === null) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDoctor]);

  const openModal = (type, appointment) => {
    setSelected(appointment);
    setModal(type);
    setNewDate('');
    setVisitSummary('');
    setPrescription('');
  };

  const closeModal = () => {
    setModal('');
    setSelected(null);
  };

  // ===== Aksi dokter =====
  const handleStatus = async (appointment, status) => {
    try {
      const res = await axios.post(
        `${API}/doctor/handlestatus`,
        { userid: appointment.userInfo._id, appointmentId: appointment._id, status },
        { headers: authHeader() }
      );
      if (res.data.success) {
        message.success(`Appointment ${status}`);
        refresh();
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!visitSummary.trim()) {
      message.error('Visit summary is required');
      return;
    }
    try {
      const res = await axios.post(
        `${API}/doctor/visitsummary`,
        { appointmentId: selected._id, visitSummary, prescription },
        { headers: authHeader() }
      );
      if (res.data.success) {
        message.success(res.data.message);
        closeModal();
        refresh();
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleDownload = async (appointment) => {
    try {
      const res = await axios.get(`${API}/doctor/getdocumentdownload`, {
        headers: authHeader(),
        params: { appointId: appointment._id },
        responseType: 'blob',
      });
      const fileUrl = window.URL.createObjectURL(
        new Blob([res.data], { type: appointment.document.mimetype || res.data.type })
      );
      const link = document.createElement('a');
      link.href = fileUrl;
            link.setAttribute('download', appointment.document.originalname || appointment.document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError(error);
    }
  };

  // ===== Aksi pasien =====
  const handleCancel = async (appointment) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return; // user klik Cancel di prompt
    try {
      const res = await axios.post(
        `${API}/user/cancelappointment`,
        { appointmentId: appointment._id, reason },
        { headers: authHeader() }
      );
      if (res.data.success) {
        message.success(res.data.message);
        refresh();
      }
    } catch (error) {
      showError(error);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate) {
      message.error('Please choose a new date');
      return;
    }
    try {
      const res = await axios.post(
        `${API}/user/rescheduleappointment`,
        { appointmentId: selected._id, newDate: newDate.replace('T', ' ') },
        { headers: authHeader() }
      );
      if (res.data.success) {
        message.success(res.data.message);
        closeModal();
        refresh();
      }
    } catch (error) {
      showError(error);
    }
  };

  // ===== Tombol aksi per baris =====
  const renderDoctorActions = (appointment) => {
    switch (appointment.status) {
      case 'pending':
        return (
          <div className="d-flex gap-1">
            <Button size="sm" variant="success" onClick={() => handleStatus(appointment, 'approved')}>Approve</Button>
            <Button size="sm" variant="danger" onClick={() => handleStatus(appointment, 'rejected')}>Reject</Button>
          </div>
        );
      case 'approved':
        return <Button size="sm" onClick={() => openModal('complete', appointment)}>Complete</Button>;
      case 'completed':
        return <Button size="sm" variant="outline-success" onClick={() => openModal('summary', appointment)}>View Summary</Button>;
      default:
        return '-';
    }
  };

  const renderUserActions = (appointment) => {
    if (['pending', 'approved'].includes(appointment.status)) {
      return (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary" onClick={() => openModal('reschedule', appointment)}>Reschedule</Button>
          <Button size="sm" variant="outline-danger" onClick={() => handleCancel(appointment)}>Cancel</Button>
        </div>
      );
    }
    if (appointment.status === 'completed') {
      return <Button size="sm" variant="outline-success" onClick={() => openModal('summary', appointment)}>View Summary</Button>;
    }
    if (appointment.status === 'cancelled' && appointment.cancelReason) {
      return <small className="text-muted">Reason: {appointment.cancelReason}</small>;
    }
    return '-';
  };

  const emptyRow = (cols) => (
    <tr>
      <td colSpan={cols}>
        <Alert variant="info" className="mb-0">
          <Alert.Heading>No Appointments to show</Alert.Heading>
        </Alert>
      </td>
    </tr>
  );

  return (
    <div>
      <h2 className="p-3 text-center">All Appointments</h2>
      <Container>
        {isDoctor ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date of Appointment</th>
                <th>Phone</th>
                <th>Document</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {doctorAppointments.length > 0
                ? doctorAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.userInfo.fullName}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.userInfo.phone}</td>
                      <td>
                        {appointment.document?.filename ? (
                          <Button variant="link" className="p-0" onClick={() => handleDownload(appointment)}>
                            Download
                          </Button>
                        ) : (
                          'No document'
                        )}
                      </td>
                      <td><StatusBadge status={appointment.status} /></td>
                      <td>{renderDoctorActions(appointment)}</td>
                    </tr>
                  ))
                : emptyRow(6)}
            </tbody>
          </Table>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Date of Appointment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userAppointments.length > 0
                ? userAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>{appointment.docName}</td>
                      <td>{appointment.date}</td>
                      <td><StatusBadge status={appointment.status} /></td>
                      <td>{renderUserActions(appointment)}</td>
                    </tr>
                  ))
                : emptyRow(4)}
            </tbody>
          </Table>
        )}
      </Container>

      {/* ===== Modal ===== */}
      <Modal show={modal !== ''} onHide={closeModal} centered>
        {modal === 'reschedule' && selected && (
          <Form onSubmit={handleReschedule}>
            <Modal.Header closeButton>
              <Modal.Title>Reschedule Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-1">Doctor: <b>{selected.docName}</b></p>
              <p>Current date: <b>{selected.date}</b></p>
              <Form.Label>New Date and Time</Form.Label>
              <Form.Control
                type="datetime-local"
                min={getMinDateTime()}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
              <small className="text-muted">The doctor will need to approve the new schedule.</small>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Close</Button>
              <Button type="submit">Save</Button>
            </Modal.Footer>
          </Form>
        )}

        {modal === 'complete' && selected && (
          <Form onSubmit={handleComplete}>
            <Modal.Header closeButton>
              <Modal.Title>Visit Summary</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Patient: <b>{selected.userInfo.fullName}</b> ({selected.date})</p>
              <Form.Group className="mb-3">
                <Form.Label>Summary / Diagnosis *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={visitSummary}
                  onChange={(e) => setVisitSummary(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Prescription / Follow-up Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Close</Button>
              <Button type="submit" variant="success">Save & Complete</Button>
            </Modal.Footer>
          </Form>
        )}

        {modal === 'summary' && selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Visit Summary</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-1">Date: <b>{selected.date}</b></p>
              <p>
                {isDoctor ? 'Patient' : 'Doctor'}:{' '}
                <b>{isDoctor ? selected.userInfo.fullName : selected.docName}</b>
              </p>
              <h6>Summary / Diagnosis</h6>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selected.visitSummary || '-'}</p>
              <h6>Prescription / Follow-up Notes</h6>
              <p style={{ whiteSpace: 'pre-wrap' }}>{selected.prescription || '-'}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Close</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserAppointments;