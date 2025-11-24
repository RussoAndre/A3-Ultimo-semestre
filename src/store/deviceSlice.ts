import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { deviceService } from '../services/device.service'
import {
  Device,
  CreateDeviceDto,
  UpdateDeviceDto,
  DisposeDeviceDto,
} from '../types/device.types'

interface DeviceState {
  devices: Device[]
  disposedDevices: Device[]
  selectedDevice: Device | null
  loading: boolean
  error: string | null
}

const initialState: DeviceState = {
  devices: [],
  disposedDevices: [],
  selectedDevice: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const devices = await deviceService.getDevices()
      return devices
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch devices')
    }
  }
)

export const fetchDeviceById = createAsyncThunk(
  'devices/fetchDeviceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const device = await deviceService.getDeviceById(id)
      return device
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch device')
    }
  }
)

export const createDevice = createAsyncThunk(
  'devices/createDevice',
  async (data: CreateDeviceDto, { rejectWithValue }) => {
    try {
      const device = await deviceService.createDevice(data)
      return device
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create device')
    }
  }
)

export const updateDevice = createAsyncThunk(
  'devices/updateDevice',
  async ({ id, data }: { id: string; data: UpdateDeviceDto }, { rejectWithValue }) => {
    try {
      const device = await deviceService.updateDevice(id, data)
      return device
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update device')
    }
  }
)

export const deleteDevice = createAsyncThunk(
  'devices/deleteDevice',
  async (id: string, { rejectWithValue }) => {
    try {
      await deviceService.deleteDevice(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete device')
    }
  }
)

export const disposeDevice = createAsyncThunk(
  'devices/disposeDevice',
  async ({ id, data }: { id: string; data: DisposeDeviceDto }, { rejectWithValue }) => {
    try {
      const device = await deviceService.disposeDevice(id, data)
      return device
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dispose device')
    }
  }
)

export const fetchDisposalHistory = createAsyncThunk(
  'devices/fetchDisposalHistory',
  async (_, { rejectWithValue }) => {
    try {
      const devices = await deviceService.getDisposalHistory()
      return devices
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch disposal history'
      )
    }
  }
)

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedDevice: (state, action: PayloadAction<Device | null>) => {
      state.selectedDevice = action.payload
    },
    clearSelectedDevice: (state) => {
      state.selectedDevice = null
    },
  },
  extraReducers: (builder) => {
    // Fetch devices
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false
        state.devices = action.payload
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch device by ID
    builder
      .addCase(fetchDeviceById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeviceById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDevice = action.payload
      })
      .addCase(fetchDeviceById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create device
    builder
      .addCase(createDevice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.loading = false
        state.devices.push(action.payload)
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update device
    builder
      .addCase(updateDevice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.loading = false
        const index = state.devices.findIndex((d) => d.id === action.payload.id)
        if (index !== -1) {
          state.devices[index] = action.payload
        }
        if (state.selectedDevice?.id === action.payload.id) {
          state.selectedDevice = action.payload
        }
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Delete device
    builder
      .addCase(deleteDevice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.loading = false
        state.devices = state.devices.filter((d) => d.id !== action.payload)
        if (state.selectedDevice?.id === action.payload) {
          state.selectedDevice = null
        }
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Dispose device
    builder
      .addCase(disposeDevice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(disposeDevice.fulfilled, (state, action) => {
        state.loading = false
        const index = state.devices.findIndex((d) => d.id === action.payload.id)
        if (index !== -1) {
          state.devices[index] = action.payload
        }
        if (state.selectedDevice?.id === action.payload.id) {
          state.selectedDevice = action.payload
        }
      })
      .addCase(disposeDevice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch disposal history
    builder
      .addCase(fetchDisposalHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDisposalHistory.fulfilled, (state, action) => {
        state.loading = false
        state.disposedDevices = action.payload
      })
      .addCase(fetchDisposalHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedDevice, clearSelectedDevice } = deviceSlice.actions
export default deviceSlice.reducer
