import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = 'https://taskmanager-k7o4.onrender.com/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false); // New state for edit modal
  const [taskToEdit, setTaskToEdit] = useState(null); // New state for task being edited
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    linkedFile: null,
  });

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handlers for Add Task Modal
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };
  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setFormData({ title: '', description: '', deadline: '', linkedFile: null });
  };
  const handleAddModalChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleAddFileChange = (e) => {
    setFormData({ ...formData, linkedFile: e.target.files[0] });
  };

  // Handlers for Edit Task Modal 
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    // Pre-populate form data for editing
    setFormData({
      title: task.title,
      description: task.description,
      deadline: task.deadline.substring(0, 10), // Format date for input field
      linkedFile: null,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setTaskToEdit(null);
    setFormData({ title: '', description: '', deadline: '', linkedFile: null });
  };
  const handleEditModalChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('deadline', formData.deadline);
    if (formData.linkedFile) {
      data.append('linkedFile', formData.linkedFile);
    }

    try {
      await axios.post(API_URL, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchTasks();
      handleCloseAddModal();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!taskToEdit) return;
    try {
      await axios.patch(`${API_URL}/${taskToEdit._id}`, {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
      });
      fetchTasks();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleMarkAsDone = async (task) => {
    try {
      await axios.patch(`${API_URL}/${task._id}`, { status: 'DONE' });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDownloadFile = (id) => {
    window.open(`${API_URL}/${id}/file`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE':
      case 'Achieved':
        return 'success';
      case 'Failed':
        return 'error';
      case 'TODO':
      case 'In Progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        {tasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h4" color="text.secondary">
              No tasks found!
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.displayStatus || task.status}
                        color={getStatusColor(task.displayStatus || task.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {task.status === 'TODO' && (
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleMarkAsDone(task)}
                          title="Mark as Done"
                        >
                          <DoneIcon />
                        </IconButton>
                      )}
                      {task.linkedFile && (
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleDownloadFile(task._id)}
                          title="Download File"
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      )}
                      {/* New Edit Button with onClick handler */}
                      <IconButton
                        color="warning"
                        size="small"
                        onClick={() => handleOpenEditModal(task)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: '50%', width: 56, height: 56 }}
            onClick={handleOpenAddModal}
            title="Add Task"
          >
            <AddIcon />
          </Button>
        </Box>
      </Container>

      {/* Add Task Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddTask}>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={handleAddModalChange}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.description}
              onChange={handleAddModalChange}
              required
            />
            <TextField
              margin="dense"
              name="deadline"
              label="Deadline"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={formData.deadline}
              onChange={handleAddModalChange}
              required
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Attach PDF File (Optional)
            </Typography>
            <input
              type="file"
              name="linkedFile"
              onChange={handleAddFileChange}
              accept="application/pdf"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Edit Task Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleEditModalChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleEditModalChange}
            required
          />
          <TextField
            margin="dense"
            name="deadline"
            label="Deadline"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={formData.deadline}
            onChange={handleEditModalChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;