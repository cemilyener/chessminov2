# Chess PDF Generator

## Overview
The Chess PDF Generator is a React application that allows users to arrange chess positions without pawns, save these positions, and generate a PDF document containing the saved positions. The application utilizes Zustand for state management and the react-chessboard library for rendering the chessboard.

## Features
- Interactive chessboard for arranging positions.
- Save and manage multiple chess positions.
- Toggle between white and black turns.
- Reset the chessboard to standard or empty positions.
- Generate a PDF document of saved positions using jsPDF and html2canvas.

## Project Structure
```
chess-pdf-generator
├── src
│   ├── components
│   │   ├── ChessboardComponent.jsx
│   │   └── SavedPositionsList.jsx
│   ├── pages
│   │   └── PawnlessArrangementPage.jsx
│   ├── store
│   │   └── useChessStore.js
│   ├── utils
│   │   └── pdfGenerator.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── tailwind.config.js
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd chess-pdf-generator
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to access the application.

## Dependencies
- React
- Zustand
- react-chessboard
- jsPDF
- html2canvas
- Tailwind CSS

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.