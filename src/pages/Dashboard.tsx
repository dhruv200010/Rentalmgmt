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
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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

interface PropertyFormData {
  name: string;
  backgroundColor: string;
  rooms: RoomConfig[];
}

interface AddPropertyDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (property: Omit<Property, 'id'>) => void;
  propertyToEdit?: Property;
}

const AddPropertyDialog: React.FC<AddPropertyDialogProps> = ({ open, onClose, onAdd, propertyToEdit }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    backgroundColor: '#90CAF9',
    rooms: [
      { type: 'P', count: 0 },
      { type: 'S', count: 0 },
      { type: 'G', count: 0 },
    ],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (propertyToEdit) {
      const roomCounts = propertyToEdit.rooms.reduce((acc, room) => {
        acc[room.type] = (acc[room.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setFormData({
        name: propertyToEdit.name,
        backgroundColor: propertyToEdit.backgroundColor,
        rooms: [
          { type: 'P', count: roomCounts['P'] || 0 },
          { type: 'S', count: roomCounts['S'] || 0 },
          { type: 'G', count: roomCounts['G'] || 0 },
        ],
      });
    }
  }, [propertyToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      backgroundColor: color,
    }));
  };

  const handleRoomCountChange = (type: 'P' | 'S' | 'G', count: number) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(config =>
        config.type === type ? { ...config, count: Math.max(0, count) } : config
      ),
    }));
  };

  const getRoomTypeLabel = (type: 'P' | 'S' | 'G') => {
    switch (type) {
      case 'P': return 'Private Rooms';
      case 'S': return 'Shared Rooms';
      case 'G': return 'Garage';
      default: return '';
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Property name is required');
      return false;
    }

    const totalRooms = formData.rooms.reduce((sum, config) => sum + config.count, 0);
    if (totalRooms === 0) {
      setError('At least one room is required');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (propertyToEdit) {
      // For editing, preserve existing rooms and only update name and color
      const updatedProperty: Omit<Property, 'id'> = {
        name: formData.name.toUpperCase(),
        backgroundColor: formData.backgroundColor,
        rooms: propertyToEdit.rooms, // Preserve existing rooms
      };
      onAdd(updatedProperty);
    } else {
      // For new property, create rooms based on configuration
      const rooms: Room[] = formData.rooms.flatMap(config =>
        Array(config.count).fill(null).map(() => ({
          type: config.type,
          isOccupied: false,
        }))
      );

      const newProperty: Omit<Property, 'id'> = {
        name: formData.name.toUpperCase(),
        backgroundColor: formData.backgroundColor,
        rooms,
      };
      onAdd(newProperty);
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      backgroundColor: '#90CAF9',
      rooms: [
        { type: 'P', count: 0 },
        { type: 'S', count: 0 },
        { type: 'G', count: 0 },
      ],
    });
    setError('');
    onClose();
  };

  const colorOptions = [
    '#90CAF9', // Light Blue
    '#CE93D8', // Purple
    '#FFD54F', // Amber
    '#81C784', // Light Green
    '#FF8A65', // Deep Orange
    '#F48FB1', // Pink
    '#4FC3F7', // Light Blue
    '#7986CB', // Indigo
    '#9575CD', // Deep Purple
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{propertyToEdit ? 'Edit Property' : 'Add New Property'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              label="Property Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              error={!!error && !formData.name}
              helperText={error && !formData.name ? error : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Card Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  onClick={() => handleColorChange(color)}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.backgroundColor === color ? '2px solid #000' : '2px solid transparent',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Room Configuration
            </Typography>
          </Grid>
          {formData.rooms.map((config) => (
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {propertyToEdit ? 'Update' : 'Add'}
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

const PropertyCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
}));

const PropertyName = styled(Typography)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(2),
  fontSize: '1.5rem',
  fontWeight: 'bold',
}));

const RoomList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const RoomEntry = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const RoomTypeBox = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  position: 'relative',
}));

const TenantInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'white',
}));

const Dashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [openPropertyDialog, setOpenPropertyDialog] = useState(false);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{ propertyId: string; roomIndex: number } | null>(null);
  const [openLeadDialog, setOpenLeadDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>();
  const [leadFormData, setLeadFormData] = useState<Partial<Lead>>({
    name: '',
    location: 'Austin',
    contactNo: '',
    source: 'Roomies',
    tags: ['New'],
    reminderDateTime: null,
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>();
  const navigate = useNavigate();

  // Calculate summary metrics
  const totalProperties = properties.length;
  const totalRooms = properties.reduce((sum, property) => sum + property.rooms.length, 0);
  const occupiedRooms = properties.reduce(
    (sum, property) => sum + property.rooms.filter(room => room.isOccupied).length,
    0
  );
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  const activeLeads = leads.filter(lead => lead.tags.includes('New') || lead.tags.includes('Follow Up')).length;

  // Load leads from localStorage on component mount
  useEffect(() => {
    const loadLeads = () => {
      try {
        const savedLeads = localStorage.getItem('leads');
        if (savedLeads) {
          const parsedLeads = JSON.parse(savedLeads);
          const leadsWithDates = parsedLeads.map((lead: any) => ({
            ...lead,
            reminderDateTime: lead.reminderDateTime ? new Date(lead.reminderDateTime) : null
          }));
          setLeads(leadsWithDates);
        }
      } catch (error) {
        console.error('Error loading leads:', error);
      }
    };

    // Load leads immediately
    loadLeads();

    // Also load leads when the window regains focus (in case of tab switch)
    window.addEventListener('focus', loadLeads);
    return () => window.removeEventListener('focus', loadLeads);
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    const saveLeads = () => {
      try {
        localStorage.setItem('leads', JSON.stringify(leads));
      } catch (error) {
        console.error('Error saving leads:', error);
      }
    };

    // Save leads immediately when they change
    saveLeads();

    // Also save leads when the window loses focus (in case of tab switch)
    window.addEventListener('blur', saveLeads);
    return () => window.removeEventListener('blur', saveLeads);
  }, [leads]);

  const handleAddProperty = (newProperty: Omit<Property, 'id'>) => {
    if (selectedProperty) {
      // Update existing property
      setProperties(prev =>
        prev.map(prop =>
          prop.id === selectedProperty.id
            ? {
                ...prop,
                name: newProperty.name,
                backgroundColor: newProperty.backgroundColor,
                rooms: newProperty.rooms,
              }
            : prop
        )
      );
    } else {
      // Add new property
      const id = (properties.length + 1).toString();
      setProperties(prev => [...prev, { ...newProperty, id }]);
    }
    setSelectedProperty(undefined);
    setOpenPropertyDialog(false);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setOpenPropertyDialog(true);
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setProperties(prev => prev.filter(prop => prop.id !== propertyId));
    }
  };

  const handleRoomClick = (propertyId: string, roomIndex: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedRoom({
        propertyId,
        roomIndex,
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
      setSelectedLead(undefined);
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
    setSelectedLead(undefined);
    setLeadFormData({
      name: '',
      location: 'Austin',
      contactNo: '',
      source: 'Roomies',
      tags: ['New'],
      reminderDateTime: null,
    });
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
      setLeads(prev => {
        const updatedLeads = prev.map(lead =>
          lead.id === selectedLead.id ? { ...lead, ...leadFormData } : lead
        );
        return updatedLeads;
      });
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
    console.log('Deleting lead:', id);
    setLeads(prev => {
      const updatedLeads = prev.filter(lead => lead.id !== id);
      console.log('Leads after deletion:', updatedLeads);
      return updatedLeads;
    });
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

  const calculateTimeRemaining = (leaseEnd?: Date) => {
    if (!leaseEnd) return '';
    const now = new Date();
    const end = new Date(leaseEnd);
    const diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + end.getMonth() - now.getMonth();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffMonths > 0) {
      return `${diffMonths} M`;
    }
    return `${diffDays} D`;
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Properties
              </Typography>
              <Typography variant="h4">{totalProperties}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Rooms
              </Typography>
              <Typography variant="h4">{totalRooms}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Occupancy Rate
              </Typography>
              <Typography variant="h4">{occupancyRate.toFixed(1)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Leads
              </Typography>
              <Typography variant="h4">{activeLeads}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Properties Overview */}
      <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4">Dashboard</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Welcome, USER!
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenPropertyDialog(true)}
              sx={{
                bgcolor: '#2196f3',
                color: 'white',
                '&:hover': {
                  bgcolor: '#1976d2',
                },
              }}
            >
              Add Property
            </Button>
          </Box>
          <Grid container spacing={3}>
            {properties.map((property: Property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <PropertyCard sx={{ backgroundColor: property.backgroundColor }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <PropertyName>{property.name}</PropertyName>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProperty(property)}
                        sx={{ color: 'white' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProperty(property.id)}
                        sx={{ color: 'white' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <RoomList>
                    {property.rooms.map((room: Room, index: number) => (
                      <RoomEntry
                        key={index}
                        onClick={() => handleRoomClick(property.id, index)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <RoomTypeBox>
                          {room.type}
                          {room.isOccupied && <OccupancyDot />}
                        </RoomTypeBox>
                        <TenantInfo>
                          <Typography variant="body1">
                            {room.isOccupied ? room.tenantName : 'Vacant'}
                          </Typography>
                          {room.isOccupied && room.leaseEnd && (
                            <Typography variant="body2">
                              {calculateTimeRemaining(room.leaseEnd)}
                            </Typography>
                          )}
                        </TenantInfo>
                      </RoomEntry>
                    ))}
                  </RoomList>
                </PropertyCard>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Recent Leads</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenLeadDialog()}
            >
              Add Lead
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Reminder</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.slice(0, 5).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.location}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {lead.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {lead.reminderDateTime && (
                        <Chip
                          icon={<NotificationsIcon />}
                          label={new Date(lead.reminderDateTime).toLocaleString()}
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenLeadDialog(lead)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteLead(lead.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Upcoming Tasks
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Monthly Inspection</TableCell>
                  <TableCell>LUCIDA</TableCell>
                  <TableCell>2024-03-15</TableCell>
                  <TableCell>
                    <Chip label="Pending" color="warning" size="small" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lease Renewal</TableCell>
                  <TableCell>KYLE</TableCell>
                  <TableCell>2024-03-20</TableCell>
                  <TableCell>
                    <Chip label="Upcoming" color="info" size="small" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPropertyDialog
        open={openPropertyDialog}
        onClose={() => {
          setOpenPropertyDialog(false);
          setSelectedProperty(undefined);
        }}
        onAdd={handleAddProperty}
        propertyToEdit={selectedProperty}
      />

      {selectedRoom && (
        <RoomDialog
          open={openRoomDialog}
          onClose={() => setOpenRoomDialog(false)}
          room={properties
            .find(p => p.id === selectedRoom.propertyId)!
            .rooms[selectedRoom.roomIndex]}
          propertyName={properties.find(p => p.id === selectedRoom.propertyId)!.name}
          onSave={handleRoomUpdate}
        />
      )}

      <Dialog open={openLeadDialog} onClose={handleCloseLeadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                value={leadFormData.name}
                onChange={handleLeadInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contact Number"
                name="contactNo"
                value={leadFormData.contactNo}
                onChange={handleLeadInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  value={leadFormData.tags}
                  onChange={handleTagsChange}
                  label="Tags"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
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
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Reminder Date & Time"
                  value={leadFormData.reminderDateTime}
                  onChange={handleReminderChange}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
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