import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

interface Lead {
  id: string;
  name: string;
  location: 'Austin' | 'Kyle';
  contactNo: string;
  source: 'Roomies' | 'Sulekha' | 'Telegram' | 'Zillow' | 'Roomster' | 'Whatsapp' | 'Others';
  tag: 'New' | 'Follow Up' | 'Lease Sent' | 'Landed' | 'No';
  reminderDateTime?: Date;
  notes?: string;
  createdAt: Date;
}

const locations = ['Austin', 'Kyle'] as const;
const sources = ['Roomies', 'Sulekha', 'Telegram', 'Zillow', 'Roomster', 'Whatsapp', 'Others'] as const;
const tags = ['New', 'Follow Up', 'Lease Sent', 'Landed', 'No'] as const;

const getTagColor = (tag: Lead['tag']) => {
  switch (tag) {
    case 'New': return 'info';
    case 'Follow Up': return 'warning';
    case 'Lease Sent': return 'secondary';
    case 'Landed': return 'success';
    case 'No': return 'error';
    default: return 'default';
  }
};

interface LeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  initialData?: Lead;
}

const LeadDialog: React.FC<LeadDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt'>>({
    name: initialData?.name || '',
    location: initialData?.location || 'Austin',
    contactNo: initialData?.contactNo || '',
    source: initialData?.source || 'Others',
    tag: initialData?.tag || 'New',
    reminderDateTime: initialData?.reminderDateTime,
    notes: initialData?.notes || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      reminderDateTime: date || undefined,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Location</InputLabel>
            <Select
              name="location"
              value={formData.location}
              onChange={handleSelectChange}
              label="Location"
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Contact Number"
            name="contactNo"
            value={formData.contactNo}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Source</InputLabel>
            <Select
              name="source"
              value={formData.source}
              onChange={handleSelectChange}
              label="Source"
            >
              {sources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Tag</InputLabel>
            <Select
              name="tag"
              value={formData.tag}
              onChange={handleSelectChange}
              label="Tag"
            >
              {tags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Reminder Date & Time"
              value={formData.reminderDateTime}
              onChange={handleDateChange}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
          <TextField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!formData.name || !formData.contactNo}
        >
          {initialData ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: (leads.length + 1).toString(),
      createdAt: new Date(),
    };
    setLeads(prev => [...prev, newLead]);

    // Schedule notification if reminder is set
    if (leadData.reminderDateTime) {
      const now = new Date();
      const reminderTime = new Date(leadData.reminderDateTime);
      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      if (timeUntilReminder > 0) {
        setTimeout(() => {
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Lead Reminder', {
              body: `Reminder for lead: ${leadData.name}`,
              icon: '/notification-icon.png'
            });
          }
        }, timeUntilReminder);
      }
    }
  };

  const handleEditLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    if (editingLead) {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === editingLead.id
            ? { ...lead, ...leadData }
            : lead
        )
      );
    }
    setEditingLead(null);
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setLeads(prev => prev.filter(lead => lead.id !== id));
    }
  };

  // Request notification permission on component mount
  React.useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">Leads</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Lead
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Tag</TableCell>
              <TableCell>Reminder</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.location}</TableCell>
                <TableCell>{lead.contactNo}</TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>
                  <Chip
                    label={lead.tag}
                    color={getTagColor(lead.tag)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {lead.reminderDateTime && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <NotificationsIcon color="action" fontSize="small" />
                      <Typography variant="body2">
                        {new Date(lead.reminderDateTime).toLocaleString()}
                      </Typography>
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingLead(lead);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteLead(lead.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <LeadDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingLead(null);
        }}
        onSave={editingLead ? handleEditLead : handleAddLead}
        initialData={editingLead || undefined}
      />
    </Box>
  );
};

export default Leads; 