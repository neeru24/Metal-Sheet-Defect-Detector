# Steel Coil Defect Detection Web App

Made by Farhan Khan

This project is a full-stack AI-powered web application that allows users to upload an image of a steel coil and receive visual feedback with detected defects highlighted. The backend uses a trained YOLOv8 model for object detection, while the frontend is built with React for a simple and responsive user experience.

---

## Overview

The application enables automated defect detection in steel coil images using computer vision. It processes uploaded images, runs inference using a trained YOLOv8 model, draws bounding boxes around detected defects, and returns the processed image to the user.

The system runs locally and does not require internet access once dependencies are installed.

---

## Features

- Upload steel coil images
- Automatic defect detection using a trained YOLOv8 model
- Bounding boxes drawn around detected defects
- Clean and responsive React user interface
- Fully functional in local deployment

---

## Tech Stack

| Component    | Technology                     |
|--------------|--------------------------------|
| Frontend     | React, Axios                   |
| Backend      | Flask, Flask-CORS              |
| ML Model     | YOLOv8 (Ultralytics)           |
| Image Utils  | Pillow (PIL), BytesIO          |

---

## How It Works

### 1. React Frontend
- Allows users to upload an image
- Sends the image to the Flask backend via HTTP request
- Receives and displays the processed image with defect annotations

### 2. Flask Backend
- Receives the uploaded image
- Loads the trained YOLOv8 model
- Runs inference to detect defects
- Draws bounding boxes on detected areas
- Returns the updated image to the frontend

---

## Project Structure

```
project/
│
├── backend/
│   ├── app.py           # Flask API with YOLO integration
│   └── my_model.pt      # Trained YOLOv8 model
│
├── frontend/
│   ├── src/
│   │   └── App.js       # React UI logic
│   └── public/
│       └── index.html   # Entry point
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.8+
- pip (Python package manager)

---

## Backend Setup

### 1. Create and Activate Virtual Environment (Recommended)

On Windows (PowerShell):

```bash
python -m venv venv
venv\Scripts\activate
```

On macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Backend Dependencies

If using requirements file:

```bash
pip install -r requirements.txt
```

If installing manually:

```bash
pip install flask flask-cors ultralytics pillow
```

### 3. Run Backend Server

```bash
cd backend
python app.py
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React development server will start and open the application in your browser.

---

## Example Usage

1. Start both backend and frontend servers.
2. Open the application in your browser.
3. Upload a steel coil image.
4. Wait briefly while the model performs detection.
5. View the resulting image with bounding boxes highlighting detected defects.

---

## Future Improvements

- Add confidence score display for each detected defect
- Support batch image uploads
- Store detection history
- Deploy to cloud environment (AWS, Azure, or GCP)
- Add authentication and user management

---

## License

This project is licensed under the MIT License.
