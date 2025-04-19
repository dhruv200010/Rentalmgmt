import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
  const navigate = useNavigate();

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
    // Navigate to property edit page
    navigate(`/properties/${propertyId}`);
  };

  return (
    <Box>
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
    </Box>
  );
};

export default Dashboard; 