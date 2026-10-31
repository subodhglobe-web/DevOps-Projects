apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
stringData:
  MYSQL_ROOT_PASSWORD: "StrongPassword@123"
  MYSQL_DATABASE: "todo_db"

