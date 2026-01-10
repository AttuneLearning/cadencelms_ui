#!/bin/bash

# Check if admin user exists, if not create one
echo "0. Checking if admin user exists..."
CHECK_LOGIN=$(curl -s -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.org","password":"AdminSecure123!"}')

CHECK_TOKEN=$(echo $CHECK_LOGIN | jq -r '.data.accessToken')

if [ "$CHECK_TOKEN" = "null" ] || [ -z "$CHECK_TOKEN" ]; then
  echo "Admin user does not exist. Creating admin user..."
  CREATE_ADMIN=$(curl -s -X POST http://localhost:5000/api/v2/auth/register/staff \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@lms.org",
      "password": "AdminSecure123!",
      "firstName": "System",
      "lastName": "Administrator",
      "roles": ["system-admin"],
      "title": "System Administrator"
    }')
  echo $CREATE_ADMIN | jq '.'
else
  echo "Admin user already exists."
fi

# Step 1: Login as admin
echo -e "\n1. Logging in as admin..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.org","password":"AdminSecure123!"}')

TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.accessToken')
echo "Token: $TOKEN"

  # Step 2: Create department
  echo -e "\n2. Creating department..."
  DEPT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v2/departments \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Computer Science",
      "code": "CS",
      "description": "Computer Science Department",
      "status": "active"
    }')

  DEPT_ID=$(echo $DEPT_RESPONSE | jq -r '.data.id')
  echo "Department ID: $DEPT_ID"

  # Step 3: Create staff user
  echo -e "\n3. Creating staff user..."
  STAFF_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v2/users/staff \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"staff@example.com\",
      \"password\": \"StaffPass123!\",
      \"firstName\": \"John\",
      \"lastName\": \"Instructor\",
      \"departmentAssignments\": [
        {
          \"departmentId\": \"$DEPT_ID\",
          \"role\": \"content-admin\"
        },
        {
          \"departmentId\": \"$DEPT_ID\",
          \"role\": \"dept-admin\"
        }
      ],
      \"defaultDashboard\": \"content-admin\",
      \"isActive\": true
    }")

echo $STAFF_RESPONSE | jq '.'

echo -e "\n✅ Staff user created successfully!"
echo "Login credentials:"
echo "  Email: staff@example.com"
echo "  Password: StaffPass123!"

echo -e "\n4. Testing staff login..."
curl -s -X POST http://localhost:5000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "StaffPass123!"
  }' | jq '.'
