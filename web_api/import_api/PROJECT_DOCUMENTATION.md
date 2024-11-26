# Test platform Project Documentation

## Project Overview
A web-based tool for importing, managing, and viewing API documentation with an intuitive, responsive interface.

### Tech Stack
- Frontend: React.js
- Backend: Node.js Express server
- HTTP Client: Axios

### Key Features
1. Import APIs:
   - Import from URL
   - Import from file upload
   - APIs remain visible after saving
   - Clear imported APIs functionality

2. Save APIs:
   - Save to specific directories
   - Directory-based organization
   - Toast notifications for success/failure

3. View Saved APIs:
   - Directory-based grouping
   - Collapsible document sections (collapsed by default)
   - Color-coded HTTP methods
   - API count per directory
   - Selected API highlighting

## Current Implementation

### Frontend Structure
1. Main Components:
   - `App.js`: Central state management and routing
   - `DocumentView.js`: API tree visualization
   - `ApiDetail.js`: API details display
   - `Toast.js`: Notification system

2. State Management:
   - APIs state for current view
   - Selected API tracking
   - Directory modal state
   - Loading and error states
   - Active tab tracking

### Backend Structure
1. Key Endpoints:
   - `/api/saved-apis`: Get all saved APIs with directory structure
   - `/api/save`: Save APIs to specific directory
   - `/convert`: Convert uploaded file to API format
   - `/convert-url`: Convert URL to API format

2. File Management:
   - APIs stored in directory-based JSON structure
   - Maintains original directory information

### Key Workflows
1. Import Flow:
   ```
   Upload/URL Input -> Convert to API format -> Display in Import tab
   ```

2. Save Flow:
   ```
   Select API -> Choose Directory -> Save -> Show Success Toast
   ```

3. View Flow:
   ```
   Switch to Saved tab -> Load APIs by Directory -> Display in Tree View
   ```

## TODO List

### High Priority
1. Delete API Feature:
   - Add delete button to API items
   - Implement delete confirmation modal
   - Add backend endpoint for API deletion
   - Update UI after deletion

2. Batch Import:
   - Add "Import All" button
   - Allow selecting target directory for batch import
   - Progress indicator for batch operations
   - Batch success/error handling

3. Search and Filter:
   - Add search bar for APIs
   - Filter by HTTP method
   - Filter by directory
   - Full-text search in API details

### Medium Priority
1. API Management:
   - Move APIs between directories
   - Rename directories
   - Bulk operations (delete, move)
   - API versioning support

2. UI Enhancements:
   - Responsive mobile view
   - Dark/Light theme toggle
   - Customizable method colors
   - Expandable API details panel

3. Import Improvements:
   - Drag and drop file upload
   - Multiple file upload
   - URL validation
   - Import history

### Low Priority
1. Export Features:
   - Export APIs to different formats
   - Export selected directories
   - Export configuration

2. Advanced Features:
   - API comparison tool
   - API documentation generation
   - API testing integration
   - Custom tags/labels for APIs

3. User Experience:
   - Keyboard shortcuts
   - Customizable layout
   - Session persistence
   - Recent APIs list

## File Structure
```
web_api/
├── import_api/
│   ├── client/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ApiDetail.js
│   │   │   │   ├── DocumentView.js
│   │   │   │   ├── DocumentView.css
│   │   │   │   └── Toast.js
│   │   │   └── App.js
│   │   └── package.json
│   └── server/
│       ├── server.js
│       └── package.json
```

## Recent Changes
1. Fixed directory structure preservation in saved APIs
2. Made documents collapsed by default in saved view
3. Prevented saved APIs from showing in import view
4. Improved save API workflow to maintain current view

## Known Issues
1. Long API paths may cause layout issues
2. Need better error handling for invalid API formats
3. Directory modal could use improved UX
4. Performance optimization needed for large API sets

## Future Considerations
1. Authentication and user management
2. API documentation versioning
3. Real-time collaboration features
4. Integration with popular API platforms
5. Custom styling options for exported documentation

## Development Guidelines
1. Keep components modular and reusable
2. Maintain consistent error handling
3. Add comments for complex logic
4. Follow React best practices
5. Keep UI/UX consistent across features
