# Pulse5G Backend Implementation Plan

## Project Overview
Pulse5G is a 5G Edge-Based Real-Time Incident Detection & Alerting System with a React Native frontend. This document outlines the complete backend implementation required to support the mobile application.

## Architecture Overview

### Technology Stack Recommendations
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL with Redis for caching
- **WebSocket**: Socket.IO or native WebSocket
- **Message Queue**: Redis Pub/Sub for real-time processing
- **Video Processing**: FFmpeg, OpenCV
- **ML/AI**: TensorFlow.js or Python microservice
- **Containerization**: Docker
- **Monitoring**: Prometheus + Grafana

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   5G Cameras    │───▶│   Edge Server    │───▶│   Mobile App    │
│   (RTSP Streams)│    │   (Backend)      │    │   (React Native)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   AI/ML Service   │
                       │   (Incident       │
                       │    Detection)     │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │   + Redis        │
                       └──────────────────┘
```

## API Endpoints Specification

### Base URL
```
http://EDGE_SERVER_IP:8000/api
```

### 1. GET /api/incidents
**Purpose**: Retrieve historical incident data

**Response Format**:
```json
{
  "incidents": [
    {
      "id": "uuid",
      "event": "Unauthorized personnel detected",
      "confidence": 0.95,
      "timestamp": "2024-03-27T10:30:00Z",
      "severity": "critical|warning|info",
      "camera_id": "CAM-01",
      "location": "Entrance Gate",
      "metadata": {
        "detection_type": "person",
        "bbox": [x, y, w, h],
        "frame_url": "/frames/frame_12345.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `severity`: Filter by severity (critical, warning, info)
- `camera_id`: Filter by camera
- `from_date`: ISO date string
- `to_date`: ISO date string

### 2. GET /api/analytics
**Purpose**: Retrieve analytics statistics

**Response Format**:
```json
{
  "total_incidents": 1247,
  "critical": 23,
  "warning": 156,
  "info": 1068,
  "trends": {
    "daily": [
      { "date": "2024-03-21", "count": 45 },
      { "date": "2024-03-22", "count": 38 }
    ],
    "hourly": [
      { "hour": "00:00", "count": 12 },
      { "hour": "01:00", "count": 8 }
    ]
  },
  "camera_stats": [
    {
      "camera_id": "CAM-01",
      "incidents": 234,
      "uptime_percentage": 98.5
    }
  ],
  "detection_accuracy": {
    "person": 0.94,
    "vehicle": 0.89,
    "anomaly": 0.76
  }
}
```

### 3. GET /api/cameras
**Purpose**: Retrieve camera status and information

**Response Format**:
```json
{
  "cameras": [
    {
      "camera_id": "CAM-01",
      "name": "Main Entrance",
      "status": "Online|Offline|Maintenance",
      "stream_quality": "HD|SD|4K",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "description": "Main Entrance Gate"
      },
      "last_seen": "2024-03-27T10:25:00Z",
      "rtsp_url": "rtsp://camera-ip:554/stream",
      "resolution": "1920x1080",
      "fps": 30,
      "model": "Axis P3225",
      "firmware": "9.80.1"
    }
  ]
}
```

### 4. POST /api/cameras (Admin)
**Purpose**: Add or update camera configuration

**Request Body**:
```json
{
  "camera_id": "CAM-04",
  "name": "Parking Lot B",
  "rtsp_url": "rtsp://192.168.1.104:554/stream",
  "location": {
    "latitude": 40.7130,
    "longitude": -74.0058,
    "description": "Parking Lot B"
  }
}
```

### 5. GET /api/health
**Purpose**: System health check

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-27T10:30:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ml_service": "connected",
    "active_cameras": 3,
    "total_cameras": 4
  }
}
```

## WebSocket Implementation

### WebSocket Endpoint
```
ws://EDGE_SERVER_IP:8000/ws/alerts
```

### Message Types

#### 1. Real-time Incident Alert
```json
{
  "type": "incident",
  "data": {
    "id": "uuid",
    "event": "Suspicious activity detected",
    "confidence": 0.87,
    "timestamp": "2024-03-27T10:30:00Z",
    "severity": "warning",
    "camera_id": "CAM-02",
    "location": "Rear Exit",
    "metadata": {
      "detection_type": "anomaly",
      "frame_url": "/frames/live_12345.jpg"
    }
  }
}
```

#### 2. Camera Status Update
```json
{
  "type": "camera_status",
  "data": {
    "camera_id": "CAM-01",
    "status": "Offline",
    "timestamp": "2024-03-27T10:30:00Z",
    "reason": "Connection lost"
  }
}
```

#### 3. System Status
```json
{
  "type": "system_status",
  "data": {
    "active_incidents": 2,
    "processing_queue": 5,
    "cpu_usage": 45.2,
    "memory_usage": 67.8
  }
}
```

## Database Schema

### PostgreSQL Tables

#### cameras
```sql
CREATE TABLE cameras (
    camera_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rtsp_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Offline',
    stream_quality VARCHAR(10) DEFAULT 'HD',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_description TEXT,
    last_seen TIMESTAMP,
    resolution VARCHAR(20),
    fps INTEGER,
    model VARCHAR(50),
    firmware VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### incidents
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id VARCHAR(20) REFERENCES cameras(camera_id),
    event TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    location_description TEXT,
    detection_type VARCHAR(50),
    bbox_x INTEGER,
    bbox_y INTEGER,
    bbox_width INTEGER,
    bbox_height INTEGER,
    frame_path TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### analytics
```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    camera_id VARCHAR(20) REFERENCES cameras(camera_id),
    incident_count INTEGER DEFAULT 0,
    severity_distribution JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date, hour, camera_id)
);
```

### Redis Data Structures

#### Real-time Cache
```
camera:CAM-01:status -> "Online"
camera:CAM-01:last_seen -> "2024-03-27T10:30:00Z"
incidents:recent -> [incident_ids...]
alerts:queue -> [alert_data...]
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
1. **Project Setup**
   - Initialize Node.js + TypeScript project
   - Set up Express.js server
   - Configure PostgreSQL and Redis
   - Implement basic middleware (CORS, logging, error handling)

2. **Database Implementation**
   - Create database schema
   - Set up migrations (using Knex.js or similar)
   - Implement database connection and models

3. **Basic API Endpoints**
   - Implement `/api/health`
   - Implement `/api/cameras` (GET)
   - Add basic error handling and validation

### Phase 2: Camera Integration (Week 3-4)
1. **RTSP Stream Processing**
   - Implement RTSP client to connect to cameras
   - Set up FFmpeg for video frame extraction
   - Implement frame buffering and processing pipeline

2. **Camera Management**
   - Implement camera registration and status monitoring
   - Add health checks for camera connections
   - Implement camera status updates via WebSocket

3. **WebSocket Implementation**
   - Set up WebSocket server
   - Implement connection management
   - Add camera status broadcasting

### Phase 3: AI/ML Integration (Week 5-6)
1. **Incident Detection Service**
   - Integrate with ML model (TensorFlow.js or Python microservice)
   - Implement frame processing pipeline
   - Add confidence scoring and severity classification

2. **Incident Management**
   - Implement `/api/incidents` endpoint
   - Add incident storage and retrieval
   - Implement real-time incident broadcasting

3. **Analytics Engine**
   - Implement `/api/analytics` endpoint
   - Set up analytics aggregation jobs
   - Add trend calculation and statistics

### Phase 4: Advanced Features (Week 7-8)
1. **Performance Optimization**
   - Implement caching strategies
   - Add database query optimization
   - Implement connection pooling

2. **Monitoring & Logging**
   - Set up structured logging
   - Implement metrics collection
   - Add alerting for system issues

3. **Security & Authentication**
   - Implement JWT authentication
   - Add API rate limiting
   - Implement input validation and sanitization

## Development Environment Setup

### Prerequisites
```bash
# Install required tools
npm install -g typescript ts-node nodemon
docker install docker-compose
```

### Project Structure
```
pulse5g-backend/
├── src/
│   ├── controllers/     # API route handlers
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   ├── middleware/     # Express middleware
│   ├── utils/          # Utility functions
│   ├── websocket/      # WebSocket handlers
│   ├── ml/             # ML integration
│   └── app.ts          # Application entry point
├── migrations/         # Database migrations
├── tests/             # Unit and integration tests
├── docker/            # Docker configurations
├── docs/              # API documentation
└── config/            # Configuration files
```

### Package Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "redis": "^4.6.5",
    "socket.io": "^4.6.1",
    "fluent-ffmpeg": "^2.1.2",
    "joi": "^17.9.1",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "winston": "^3.8.2",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "@types/node": "^18.15.11",
    "@types/express": "^4.17.17",
    "@types/pg": "^8.10.2",
    "typescript": "^5.0.2",
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
```

## Deployment Configuration

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/pulse5g
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=pulse5g
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/pulse5g
REDIS_URL=redis://localhost:6379

# Server
PORT=8000
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key

# ML Service
ML_SERVICE_URL=http://localhost:8080

# Camera Configuration
MAX_CONCURRENT_STREAMS=10
FRAME_EXTRACTION_INTERVAL=1000
```

## Testing Strategy

### Unit Tests
- API endpoint testing
- Database model testing
- Service layer testing
- WebSocket handler testing

### Integration Tests
- End-to-end API workflows
- Database integration
- WebSocket connection testing
- Camera stream processing

### Performance Tests
- Load testing for API endpoints
- WebSocket connection limits
- Database query performance
- Memory usage profiling

## Monitoring & Observability

### Metrics to Track
- API response times
- WebSocket connection count
- Camera stream health
- Incident detection accuracy
- System resource usage

### Logging Strategy
- Structured JSON logging
- Different log levels (error, warn, info, debug)
- Request/response logging
- Error stack traces

### Alerting
- High incident detection rates
- Camera offline notifications
- System resource thresholds
- API error rate spikes

## Security Considerations

### API Security
- JWT authentication for admin endpoints
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration

### Data Security
- Encrypted database connections
- Sensitive data encryption at rest
- Secure WebSocket connections (WSS)
- Environment variable protection

### Network Security
- VPN or private network for camera streams
- Firewall rules for database access
- SSL/TLS certificates for HTTPS
- Network segmentation

## Scalability Planning

### Horizontal Scaling
- Load balancer configuration
- Multiple backend instances
- Database read replicas
- Redis clustering

### Performance Optimization
- Database query optimization
- Caching strategies
- Connection pooling
- Asynchronous processing

### Resource Management
- Memory usage monitoring
- CPU utilization tracking
- Storage capacity planning
- Network bandwidth optimization

This implementation plan provides a comprehensive roadmap for building a robust, scalable backend system to support the Pulse5G mobile application. The phased approach allows for incremental development and testing while maintaining a clear path to production readiness.
