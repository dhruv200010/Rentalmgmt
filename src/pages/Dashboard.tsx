import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';

interface Room {
  type: 'P' | 'S' | 'G';  // P for Premium, S for Standard, G for Guest
  isOccupied: boolean;
  tenantName?: string;
  leaseStart?: Date;
  leaseEnd?: Date;
}

interface Property {
  id: string;
  name: string;
  rooms: Room[];
  backgroundColor: string;
}

interface Lead {
  id: number;
  name: string;
  location: 'Austin' | 'Kyle';
  contactNo: string;
  source: 'Roomies' | 'Sulekha' | 'Telegram' | 'Zillow' | 'Roomster' | 'Whatsapp' | 'Others';
  tags: ('New' | 'Follow Up' | 'Lease Sent' | 'Landed' | 'No')[];
  reminderDateTime: Date | null;
}

const initialProperties: Property[] = [
  {
    id: '1',
    name: 'LUCIDA',
    rooms: [
      { type: 'P', isOccupied: true, tenantName: 'John Doe' },
      { type: 'S', isOccupied: true, tenantName: 'Jane Smith' },
      { type: 'S', isOccupied: true, tenantName: 'Bob Johnson' },
      { type: 'S', isOccupied: true, tenantName: 'Alice Brown' },
      { type: 'G', isOccupied: true, tenantName: 'Charlie Wilson' },
    ],
    backgroundColor: '#90CAF9',
  },
  {
    id: '2',
    name: 'KYLE',
    rooms: [
      { type: 'P', isOccupied: true, tenantName: 'David Lee' },
      { type: 'S', isOccupied: false },
      { type: 'S', isOccupied: false },
      { type: 'S', isOccupied: false },
      { type: 'S', isOccupied: false },
    ],
    backgroundColor: '#CE93D8',
  },
  {
    id: '3',
    name: 'MORNING',
    rooms: [
      { type: 'P', isOccupied: false },
      { type: 'S', isOccupied: false },
      { type: 'S', isOccupied: false },
      { type: 'S', isOccupied: false },
      { type: 'S', isOccupied: false },
    ],
    backgroundColor: '#FFD54F',
  },
];

const RoomIndicator = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: 'white',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  margin: theme.spacing(0.5),
  fontWeight: 'bold',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const OccupancyDot = styled(Box)({
  width: 12,
  height: 12,
  backgroundColor: '#f44336',
  borderRadius: '50%',
  position: 'absolute',
  top: -4,
  right: -4,
});

interface RoomConfig {
  type: 'P' | 'S' | 'G';
  count: number;
}

interface AddPropertyDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (property: Omit<Property, 'id'>) => void;
}

const AddPropertyDialog: React.FC<AddPropertyDialogProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>([
    { type: 'P', count: 0 }, // Private rooms
    { type: 'S', count: 0 }, // Shared rooms
    { type: 'G', count: 0 }, // Garage
  ]);
  const [error, setError] = useState('');

  const handleRoomCountChange = (type: 'P' | 'S' | 'G', count: number) => {
    setRoomConfigs(prev =>
      prev.map(config =>
        config.type === type ? { ...config, count: Math.max(0, count) } : config
      )
    );
  };

  const getRoomTypeLabel = (type: 'P' | 'S' | 'G') => {
    switch (type) {
      case 'P': return 'Private Rooms';
      case 'S': return 'Shared Rooms';
      case 'G': return 'Garage';
      default: return '';
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Property name is required');
      return;
    }

    const totalRooms = roomConfigs.reduce((sum, config) => sum + config.count, 0);
    if (totalRooms === 0) {
      setError('At least one room is required');
      return;
    }

    // Create rooms array based on configuration
    const rooms: Room[] = roomConfigs.flatMap(config =>
      Array(config.count).fill(null).map(() => ({
        type: config.type,
        isOccupied: false,
      }))
    );

    const newProperty: Omit<Property, 'id'> = {
      name: name.toUpperCase(),
      rooms,
      backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16),
    };

    onAdd(newProperty);
    setName('');
    setRoomConfigs([
      { type: 'P', count: 0 },
      { type: 'S', count: 0 },
      { type: 'G', count: 0 },
    ]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Property</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Property Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!error}
              helperText={error}
            />
          </Grid>
          {roomConfigs.map((config) => (
            <Grid item xs={12} sm={4} key={config.type}>
              <TextField
                label={getRoomTypeLabel(config.type)}
                type="number"
                fullWidth
                value={config.count}
                onChange={(e) => handleRoomCountChange(config.type, parseInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  propertyName: string;
  onSave: (updatedRoom: Room) => void;
}

const RoomDialog: React.FC<RoomDialogProps> = ({
  open,
  onClose,
  room,
  propertyName,
  onSave,
}) => {
  const [formData, setFormData] = useState<Room>({
    ...room,
    tenantName: room.tenantName || '',
    leaseStart: room.leaseStart || undefined,
    leaseEnd: room.leaseEnd || undefined,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field: 'leaseStart' | 'leaseEnd', date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: date || undefined,
    }));
  };

  const handleSubmit = () => {
    if (formData.tenantName && formData.leaseStart && formData.leaseEnd) {
      onSave({
        ...formData,
        isOccupied: true,
      });
    }
    onClose();
  };

  const handleVacate = () => {
    onSave({
      ...room,
      isOccupied: false,
      tenantName: undefined,
      leaseStart: undefined,
      leaseEnd: undefined,
    });
    onClose();
  };

  const getRoomTypeLabel = (type: 'P' | 'S' | 'G') => {
    switch (type) {
      case 'P': return 'Private Room';
      case 'S': return 'Shared Room';
      case 'G': return 'Garage';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {propertyName} - {getRoomTypeLabel(room.type)}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Tenant Name"
            name="tenantName"
            value={formData.tenantName || ''}
            onChange={handleInputChange}
            fullWidth
            disabled={room.isOccupied}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Lease Start Date"
              value={formData.leaseStart}
              onChange={(date) => handleDateChange('leaseStart', date)}
              disabled={room.isOccupied}
              sx={{ width: '100%' }}
            />
            <DatePicker
              label="Lease End Date"
              value={formData.leaseEnd}
              onChange={(date) => handleDateChange('leaseEnd', date)}
              disabled={room.isOccupied}
              sx={{ width: '100%' }}
              minDate={formData.leaseStart || undefined}
            />
          </LocalizationProvider>
          {room.isOccupied && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="primary">
                Current Tenant Information:
              </Typography>
              <Typography>Name: {room.tenantName}</Typography>
              <Typography>
                Lease Period: {room.leaseStart?.toLocaleDateString()} - {room.leaseEnd?.toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {room.isOccupied ? (
          <Button onClick={handleVacate} color="error">
            Vacate Room
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.tenantName || !formData.leaseStart || !formData.leaseEnd}
          >
            Assign Room
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const Dashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    propertyId: string;
    roomIndex: number;
    room: Room;
    propertyName: string;
  } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [openLeadDialog, setOpenLeadDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadFormData, setLeadFormData] = useState<Partial<Lead>>({
    name: '',
    location: 'Austin',
    contactNo: '',
    source: 'Roomies',
    tags: ['New'],
    reminderDateTime: null,
  });
  const navigate = useNavigate();

  // Load leads from localStorage on component mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('leads');
    if (savedLeads) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        // Convert string dates back to Date objects
        const leadsWithDates = parsedLeads.map((lead: any) => ({
          ...lead,
          reminderDateTime: lead.reminderDateTime ? new Date(lead.reminderDateTime) : null
        }));
        setLeads(leadsWithDates);
      } catch (error) {
        console.error('Error loading leads from localStorage:', error);
      }
    }
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('leads', JSON.stringify(leads));
    } catch (error) {
      console.error('Error saving leads to localStorage:', error);
    }
  }, [leads]);

  const handleAddProperty = (newProperty: Omit<Property, 'id'>) => {
    const id = (properties.length + 1).toString();
    setProperties(prev => [...prev, { ...newProperty, id }]);
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
    }
  };

  const handleRoomClick = (propertyId: string, roomIndex: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedRoom({
        propertyId,
        roomIndex,
        room: property.rooms[roomIndex],
        propertyName: property.name,
      });
      setOpenRoomDialog(true);
    }
  };

  const handleRoomUpdate = (updatedRoom: Room) => {
    if (selectedRoom) {
      setProperties(prev =>
        prev.map(property =>
          property.id === selectedRoom.propertyId
            ? {
                ...property,
                rooms: property.rooms.map((room, index) =>
                  index === selectedRoom.roomIndex ? updatedRoom : room
                ),
              }
            : property
        )
      );
    }
    setOpenRoomDialog(false);
    setSelectedRoom(null);
  };

  const handlePropertyEdit = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleOpenLeadDialog = (lead?: Lead) => {
    if (lead) {
      setSelectedLead(lead);
      setLeadFormData(lead);
    } else {
      setSelectedLead(null);
      setLeadFormData({
        name: '',
        location: 'Austin',
        contactNo: '',
        source: 'Roomies',
        tags: ['New'],
        reminderDateTime: null,
      });
    }
    setOpenLeadDialog(true);
  };

  const handleCloseLeadDialog = () => {
    setOpenLeadDialog(false);
    setSelectedLead(null);
  };

  const handleLeadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLeadSelectChange = (e: any) => {
    const { name, value } = e.target;
    setLeadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (event: any) => {
    const { value } = event.target;
    setLeadFormData(prev => ({ ...prev, tags: value }));
  };

  const handleReminderChange = (date: Date | null) => {
    setLeadFormData(prev => ({ ...prev, reminderDateTime: date }));
  };

  const handleLeadSubmit = () => {
    if (selectedLead) {
      setLeads(prev =>
        prev.map(lead =>
          lead.id === selectedLead.id ? { ...lead, ...leadFormData } : lead
        )
      );
    } else {
      const newLead: Lead = {
        id: Date.now(),
        name: leadFormData.name || '',
        location: leadFormData.location || 'Austin',
        contactNo: leadFormData.contactNo || '',
        source: leadFormData.source || 'Roomies',
        tags: leadFormData.tags || ['New'],
        reminderDateTime: leadFormData.reminderDateTime || null,
      };
      setLeads(prev => [...prev, newLead]);
    }
    handleCloseLeadDialog();
  };

  const handleDeleteLead = (id: number) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      leads.forEach(lead => {
        if (lead.reminderDateTime && lead.reminderDateTime <= now) {
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Lead Reminder', {
              body: `Follow up with ${lead.name} (${lead.contactNo})`,
            });
          }
        }
      });
    };

    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [leads]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome, USER!
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: '#2196f3',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1976d2',
            },
          }}
        >
          Add Property
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {properties.map((property) => (
          <Card
            key={property.id}
            sx={{
              minWidth: 300,
              backgroundColor: property.backgroundColor,
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {property.name}
                </Typography>
                <Box>
                  <IconButton 
                    onClick={() => handlePropertyEdit(property.id)}
                    sx={{ color: 'white' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteProperty(property.id)}
                    sx={{ color: 'white' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.rooms.map((room, index) => (
                  <Tooltip 
                    key={index}
                    title={room.isOccupied ? `Occupied by ${room.tenantName}` : 'Vacant'}
                  >
                    <RoomIndicator onClick={() => handleRoomClick(property.id, index)}>
                      {room.isOccupied && <OccupancyDot />}
                      <Typography
                        variant="body1"
                        sx={{ color: 'black', fontWeight: 'bold' }}
                      >
                        {room.type}
                      </Typography>
                    </RoomIndicator>
                  </Tooltip>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Leads</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenLeadDialog()}
          >
            Add Lead
          </Button>
        </Box>

        <Grid container spacing={2}>
          {leads.map((lead) => (
            <Grid item xs={12} sm={6} md={4} key={lead.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">{lead.name}</Typography>
                      <Typography color="text.secondary">{lead.contactNo}</Typography>
                      <Typography color="text.secondary">{lead.location}</Typography>
                      <Typography color="text.secondary">Source: {lead.source}</Typography>
                      {lead.reminderDateTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {new Date(lead.reminderDateTime).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleOpenLeadDialog(lead)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteLead(lead.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    {lead.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <AddPropertyDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onAdd={handleAddProperty}
      />

      {selectedRoom && (
        <RoomDialog
          open={openRoomDialog}
          onClose={() => {
            setOpenRoomDialog(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom.room}
          propertyName={selectedRoom.propertyName}
          onSave={handleRoomUpdate}
        />
      )}

      <Dialog open={openLeadDialog} onClose={handleCloseLeadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={leadFormData.name}
              onChange={handleLeadInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={leadFormData.location}
                onChange={handleLeadSelectChange}
                label="Location"
              >
                <MenuItem value="Austin">Austin</MenuItem>
                <MenuItem value="Kyle">Kyle</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Contact Number"
              name="contactNo"
              value={leadFormData.contactNo}
              onChange={handleLeadInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                name="source"
                value={leadFormData.source}
                onChange={handleLeadSelectChange}
                label="Source"
              >
                <MenuItem value="Roomies">Roomies</MenuItem>
                <MenuItem value="Sulekha">Sulekha</MenuItem>
                <MenuItem value="Telegram">Telegram</MenuItem>
                <MenuItem value="Zillow">Zillow</MenuItem>
                <MenuItem value="Roomster">Roomster</MenuItem>
                <MenuItem value="Whatsapp">Whatsapp</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tags</InputLabel>
              <Select
                multiple
                value={leadFormData.tags}
                onChange={handleTagsChange}
                label="Tags"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Follow Up">Follow Up</MenuItem>
                <MenuItem value="Lease Sent">Lease Sent</MenuItem>
                <MenuItem value="Landed">Landed</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Reminder Date & Time"
                value={leadFormData.reminderDateTime}
                onChange={handleReminderChange}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLeadDialog}>Cancel</Button>
          <Button onClick={handleLeadSubmit} variant="contained" color="primary">
            {selectedLead ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 