# REST API Plan

## 1. Resources

The following resources are identified from the database schema:

- **Test Catalog** - Corresponds to `testCatalog` collection
- **User Profile** - Corresponds to `users` collection
- **Test Results** - Corresponds to `users/{userId}/results` subcollection
- **Test Schedule** - Corresponds to `users/{userId}/schedules` subcollection
- **AI Reports** - Corresponds to `users/{userId}/aiReports` subcollection
- **Schedule Recommendations** - Corresponds to `scheduleRecommendations` collection

## 2. Endpoints

Based on the PRD and database schema, we'll implement the following API endpoints using Firebase Cloud Functions.

### Authentication Endpoints

*Note: This will be handled directly by Firebase Authentication in the frontend, so no custom API endpoint is required.*

### Health Metrics Endpoints

#### Calculate Health Score

- **Method**: GET
- **URL**: `/api/metrics/health-score`
- **Description**: Calculate the Health Score (HS) based on user's test results
- **Query Parameters**:
  - `userId`: string (required)
- **Response Body**:
  ```json
  {
    "healthScore": number,
    "scoreCategory": "green" | "yellow" | "red"
  }
  ```
- **Success Codes**: 
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Missing userId
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized to access this data
  - 404 Not Found - User not found
  - 500 Internal Server Error

#### Calculate Compliance Score

- **Method**: GET
- **URL**: `/api/metrics/compliance-score`
- **Description**: Calculate the Compliance Score (CS) based on user's adherence to recommended test schedule
- **Query Parameters**:
  - `userId`: string (required)
- **Response Body**:
  ```json
  {
    "complianceScore": number,
    "scoreCategory": "green" | "yellow" | "red",
    "missedTests": [
      {
        "testId": "string",
        "testName": "string",
        "recommendedDate": "string"
      }
    ]
  }
  ```
- **Success Codes**: 
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Missing userId
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized to access this data
  - 404 Not Found - User not found
  - 500 Internal Server Error

### Test Result Analysis Endpoints

#### Analyze Test Result Trend

- **Method**: GET
- **URL**: `/api/results/trend`
- **Description**: Analyze trends in test results for a specific test parameter
- **Query Parameters**:
  - `userId`: string (required)
  - `testId`: string (required)
  - `paramName`: string (required)
- **Response Body**:
  ```json
  {
    "trend": "improving" | "worsening" | "stable" | "fluctuating" | "insufficient_data",
    "recentValue": number | string | boolean,
    "previousValue": number | string | boolean,
    "percentageChange": number,
    "historicalValues": [
      {
        "date": "string",
        "value": number | string | boolean
      }
    ]
  }
  ```
- **Success Codes**: 
  - 200 OK
- **Error Codes**:
  - 400 Bad Request - Missing required parameters
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized to access this data
  - 404 Not Found - Test or parameter not found
  - 500 Internal Server Error

### Test Schedule Endpoints

#### Generate Recommended Schedule

- **Method**: POST
- **URL**: `/api/schedule/generate`
- **Description**: Generate a recommended test schedule based on user profile
- **Request Body**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "schedules": [
      {
        "scheduleId": "string",
        "testId": "string",
        "testName": "string",
        "scheduledDate": "string"
      }
    ]
  }
  ```
- **Success Codes**: 
  - 201 Created
- **Error Codes**:
  - 400 Bad Request - Missing userId
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized to access this data
  - 404 Not Found - User not found
  - 500 Internal Server Error

### AI Report Endpoints

#### Generate AI Health Report

- **Method**: POST
- **URL**: `/api/reports/generate`
- **Description**: Generate an AI-powered health report based on user's test results
- **Request Body**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "reportId": "string",
    "status": "processing" | "completed" | "failed",
    "estimatedCompletionTime": "string"
  }
  ```
- **Success Codes**: 
  - 202 Accepted - Report generation started
- **Error Codes**:
  - 400 Bad Request - Missing userId
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized
  - 404 Not Found - User not found or insufficient data for report
  - 500 Internal Server Error

#### Get AI Health Report Status

- **Method**: GET
- **URL**: `/api/reports/{reportId}/status`
- **Description**: Check the status of a report generation request
- **Path Parameters**:
  - `reportId`: string (required)
- **Query Parameters**:
  - `userId`: string (required)
- **Response Body**:
  ```json
  {
    "status": "processing" | "completed" | "failed",
    "progress": number,
    "estimatedCompletionTime": "string"
  }
  ```
- **Success Codes**: 
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized
  - 404 Not Found - Report not found
  - 500 Internal Server Error

#### Get AI Health Report

- **Method**: GET
- **URL**: `/api/reports/{reportId}`
- **Description**: Retrieve a generated health report
- **Path Parameters**:
  - `reportId`: string (required)
- **Query Parameters**:
  - `userId`: string (required)
- **Response Body**:
  ```json
  {
    "reportId": "string",
    "createdAt": "string",
    "reportHtml": "string"
  }
  ```
- **Success Codes**: 
  - 200 OK
- **Error Codes**:
  - 401 Unauthorized - User not authenticated
  - 403 Forbidden - User not authorized
  - 404 Not Found - Report not found
  - 500 Internal Server Error

## 3. Authentication and Authorization

The API will use Firebase Authentication for user authentication. Each API request must include a valid Firebase ID token in the Authorization header.

### Authentication Flow

1. User registers or logs in via Firebase Authentication
2. Client obtains Firebase ID token
3. Client includes token in all API requests in Authorization header:
   ```
   Authorization: Bearer {firebase_id_token}
   ```

### Authorization Logic

- All API endpoints check the Firebase ID token to verify the user's identity
- For endpoints requiring user data access, the API verifies that the authenticated user ID matches the requested resource's owner
- Security rules in Firestore provide an additional layer of data access control

## 4. Validation and Business Logic

### User Registration Validation

- Password must meet minimum security requirements
- Birth year must be valid (between current year - 120 and current year)
- Sex must be either "male" or "female"
- Detail level must be one of "basic", "recommended", or "detailed"

### Test Result Validation

- Result parameters must match the parameters defined in the test's template
- Numeric values must be within the min/max ranges defined in validation rules
- Enumerated values must match the allowedValues defined in validation rules

### Business Logic Implementation

#### Health Score Calculation

1. The Health Score is calculated based on the percentage of test parameters that are within normal ranges
2. Score categories:
   - Green: ≥90%
   - Yellow: ≥70% and <90%
   - Red: <70%

#### Compliance Score Calculation

1. The Compliance Score is calculated based on the percentage of recommended tests completed on time
2. Score categories:
   - Green: ≥90%
   - Yellow: ≥70% and <90%
   - Red: <70%

#### Test Schedule Generation

1. Schedule is generated based on:
   - User's age
   - User's sex
   - User's selected detail level
   - Recommendations from scheduleRecommendations collection

#### AI Report Generation

1. Test results are collected and analyzed
2. AI model is invoked via Openrouter.ai API with test data
3. Report HTML is generated and stored in Firestore
4. Status updates are provided throughout the process

## 5. Security Considerations

- API endpoints use HTTPS only
- Firebase ID tokens are validated for every request
- API keys for external services (e.g., Openrouter.ai) are stored as environment variables in Cloud Functions
- Rate limiting is implemented to prevent abuse:
  - Report generation limited to 1 per day per user
  - API requests limited to 100 per minute per user
- Input validation performed on all API endpoints
- Detailed error messages are logged but not exposed to clients 