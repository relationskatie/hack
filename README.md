# Smolathon_defer_panic_159

# Create News API (Editor or Admin Only)

**POST** `/api/news`

Создает новую новость. Доступно только для пользователей с ролями **editor** или **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body (JSON)**


```json
{
  "title": "string",       
  "content": "string",      
  "filename": "string",    
  "file": "string"     
}
```

Response: 
    201 Created

```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "uploaded_by": "uuid",
  "created_at": "string",
  "file_url": "string"
}
```
    400 Bad Request
    403 Forbidden
    400 Bad Request
    500 Internal Server Error

# Get News API (Public)

**GET** `/api/news/{id}`

Возвращает информацию о конкретной новости. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор новости.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "uploaded_by": "uuid",
  "created_at": "string",
  "file_url": "string"
}
```

    400 Bad Request
    500 Internal Server Error

# Update News API (Editor or Admin Only)

**PUT** `/api/news/{id}`

Обновляет существующую новость. Доступно только пользователям с ролями **editor** или **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор новости, которую нужно обновить.

**Body (JSON)**

```json
{
  "title": "string",   
  "content": "string"  
}

```

## Response

**200 OK**

```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "uploaded_by": "uuid",
  "created_at": "string",
  "updated_at": "string"
}
```
    400 Bad Request
    403 Forbidden
    500 Internal Server Error

# Delete News API (Editor or Admin Only)

**DELETE** `/api/news/{id}`

Удаляет существующую новость. Доступно только пользователям с ролями **editor** или **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор новости, которую нужно удалить.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "message": "string"
}
 
```
    400 Bad Request
    403 Forbidden
    500 Internal Server Error


---

```markdown
# List News API (Public)

**GET** `/api/news`

Возвращает список новостей с пагинацией. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- `limit` (int) – количество новостей на страницу (опционально, по умолчанию 10)
- `offset` (int) – смещение для пагинации (опционально, по умолчанию 0)

---

## Response

**200 OK**

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "uploaded_by": "uuid",
      "created_at": "string",
      "updated_at": "string",
      "file": "string",
      "file_url": "string",
    }
  ]
}
```
    500 Internal Server Error

# Get News Count API (Public)

**GET** `/api/news/count`

Возвращает общее количество новостей. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- отсутствуют

---

## Response

**200 OK**

```json
{
  "count": 123
}
```

    500 Internal Server Error


# Create Vacancy API (Admin Only)

**POST** `/api/vacancies`

Создает новую вакансию. Доступно только пользователям с ролью **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body (JSON)**

```json
{
  "position": "string",       
  "description": "string",    
  "salary": "string",        
  "is_active": true           
}

```

Response

201 Created

```json
{
  "id": "uuid",
  "position": "string",
  "description": "string",
  "salary": "string",
  "is_active": true,
  "published_at": "string"
}
```

    400 Bad Request
    403 Forbidden
    500 Internal Server Error


# Get Vacancy API (Public)

**GET** `/api/vacancies/{id}`

Возвращает информацию о конкретной вакансии. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор вакансии.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "position": "string",
  "description": "string",
  "salary": "string",
  "is_active": true,
  "published_at": "string"
}
 ```

    400 Bad Request
    500 Internal Server Error
    
# Update Vacancy API (Admin Only)

*ЕСТЬ ОШИБКА, ВОЗВРАЩАЮТСЯ НЕ ИЗМЕНЕННЫЕ ДАННЫЕ, В БД ВСЕ ОК*
**PUT** `/api/vacancies/{id}`

Обновляет существующую вакансию. Доступно только пользователям с ролью **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор вакансии, которую нужно обновить.

**Body (JSON)**

```json
{
  "position": "string",       
  "description": "string",    
  "salary": "string",        
  "is_active": true
}
```

##Response

200 OK

```json
{
  "id": "uuid",
  "position": "string",
  "description": "string",
  "salary": "string",
  "is_active": true,
  "published_at": "string"
}
```

    400 Bad Request
    403 Forbidden
    500 Internal Server Error

# Delete Vacancy API (Admin Only)

**DELETE** `/api/vacancies/{id}`

Удаляет существующую вакансию. Доступно только пользователям с ролью **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор вакансии, которую нужно удалить.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "message": "string"
}
```
    400 Bad Request
    403 Forbidden
    500 Internal Server Error


# List All Vacancies API (Public)

**GET** `/api/vacancies`

Возвращает список всех вакансий с пагинацией. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- `limit` (int, опционально) – количество вакансий на страницу (по умолчанию 10)
- `offset` (int, опционально) – смещение для пагинации (по умолчанию 0)


---

## Response

**200 OK**

```json
{
  "items": [
    {
      "id": "uuid",
      "position": "string",
      "description": "string",
      "salary": "string",
      "is_active": true,
      "published_at": "string"
    }
  ]
}

    500 Internal Server Error

# List Active Vacancies API (Public)

**GET** `/api/vacancies/active`

Возвращает список активных вакансий с пагинацией. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- `limit` (int, опционально) – количество вакансий на страницу (по умолчанию 10)
- `offset` (int, опционально) – смещение для пагинации (по умолчанию 0)


---

## Response

**200 OK**

```json
{
  "items": [
    {
      "id": "uuid",
      "position": "string",
      "description": "string",
      "salary": "string",
      "is_active": true,
      "published_at": "string"
    }
  ]
}
```
    500 Internal Server Error


# Get Vacancies Count API (Public)

**GET** `/api/vacancies/count`

Возвращает общее количество вакансий. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- отсутствуют

---

## Response

**200 OK**

```json
{
  "count": 123
}
```

    500 Internal Server Error

# Create Document API (Admin or Editor Only)

**POST** `/api/documents`

Создает новый документ с возможностью прикрепления файла. Доступно только пользователям с ролями **admin** или **editor**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body (JSON)**

```json
{
  "title": "string",         
  "description": "string",   
  "file": "string (Base64)", 
  "filename": "string"s
}

```

##Response

201 Created
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "uploaded_by": "uuid",
  "created_at": "string (ISO 8601)",
  "filename": "string",
  "file_url": "string"
}
```

    400 Bad Request
    403 Forbidden
    500 Internal Server Error


# Get Document API (Public)

**GET** `/api/documents/{id}`

Возвращает информацию о конкретном документе. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор документа.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "uploaded_by": "uuid",
  "created_at": "string",
  "filename": "string",
  "file_url": "string"
}
```

    400 Bad Request
    500 Internal Server Error

# List Documents API (Public)

**GET** `/api/documents`

Возвращает список документов с пагинацией. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- `limit` (int, опционально) – количество документов на страницу (по умолчанию 10)
- `offset` (int, опционально) – смещение для пагинации (по умолчанию 0)


---

## Response

**200 OK**

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "uploaded_by": "uuid",
      "created_at": "string (ISO 8601)",
      "filename": "string",
      "file_url": "string"
    }
  ]
}

    500 Internal Server Error

# Delete Document API (Admin or Editor Only)

**DELETE** `/api/documents/{id}`

Удаляет существующий документ. Доступно только пользователям с ролями **admin** или **editor**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор документа, который нужно удалить.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "message": "string"
}
```

    400 Bad Request
    403 Forbidden
    500 Internal Server Error


# Create Contact API (Admin or Editor Only)
* ОШИБКА,ВОЗВРАЩАЕТ ПУСТЫЕ МАССИВЫ, НО В БД ВСЕ ДОБАВЛЯЕТСЯ КОРРЕКТНО*
**POST** `/api/contacts`

Создает новый контакт с телефонами, email и адресами. Доступно только пользователям с ролями **admin** или **editor**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body (JSON)**

```json
{
  "title": "string",         
  "phones": ["string"],      
  "emails": ["string"],      
  "addresses": ["string"]    
}
```

##Response 

201 Created

```json
{
  "id": "uuid",
  "title": "string",
  "phones": ["string"],
  "emails": ["string"],
  "addresses": ["string"]
}
```

    400 Bad Request
    403 Forbidden
    500 Internal Server Error


# Get Contact API (Public)

**GET** `/api/contacts/{id}`

Возвращает информацию о конкретном контакте. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор контакта.

---

## Response

**200 OK**

```json
{
  "id": "uuid",
  "title": "string",
  "phones": ["string"],
  "emails": ["string"],
  "addresses": ["string"]
}

```

    400 Bad Request
    500 Internal Server Error

# List Contacts API (Public)

**GET** `/api/contacts`

Возвращает список контактов с пагинацией. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Query Parameters**

- `limit` (int, опционально) – количество контактов на страницу (по умолчанию 10)
- `offset` (int, опционально) – смещение для пагинации (по умолчанию 0)


---

## Response

**200 OK**

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "phones": ["string"],
      "emails": ["string"],
      "addresses": ["string"]
    }
  ]
}

    500 Internal Server Error

# Update Contact API (Admin or Editor Only)

**PUT** `/api/contacts/{id}`

Обновляет существующий контакт. Доступно только пользователям с ролями **admin** или **editor**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор контакта, который нужно обновить.

**Body (JSON)**

```json
{
  "title": "string",         
  "phones": ["string"],      
  "emails": ["string"],      
  "addresses": ["string"]    
}

```

##Response

200 OK

```json
{
  "id": "uuid",
  "title": "string",
  "phones": ["string"],
  "emails": ["string"],
  "addresses": ["string"]
}
```

    400 Bad Request
    403 Forbidden
    500 Internal Server Error

# Delete Contact API (Editor or Admin Only)

**DELETE** `/api/contacts/{id}`

Удаляет контакт по его уникальному идентификатору. Доступно только пользователям с ролями **editor** или **admin**.

---

## Authorization

Требуется JWT-токен в заголовке `Authorization: Bearer <token>`.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор контакта, который нужно удалить.

---

## Response

**200 OK**

```json
{
  "message": "string"
}
```

    403 Forbidden
    500 Internal Server Error

# Create Project API (Admin or Editor Only)

**POST** `/api/projects`

Создает новый проект в системе. Доступно только пользователям с ролями **admin** или **editor**.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body Parameters (JSON)**

```json
{
  "tittle":"string",
  "description":"string",
  "filename":"string",
  "file":"string"
}
```

##Response

201 Created

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "uploaded_by": "string",
  "created_at": "string",
  "updated_at": "string",
  "filename": "string",
  "file" : "string", 
  "file_url": "string"
}
```

  400 Bad Request
  401 Unauthorized
  403 Forbidden
  500 Internal Server Error


**GET** `/api/projects/:id`

Возвращает проект по его уникальному идентификатору. Доступно всем пользователям.

---

## Request

**Headers**

- `Content-Type: application/json`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор проекта.

---

## Response

**200 OK**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "uploaded_by": "string",
  "created_at": "string",
  "updated_at": "string",
  "filename": "string",
  "file": "string",
  "file_url": "string"
}
 
  500 Internal Server Error

**PUT** `/api/projects/:id`

Обновляет проект по его уникальному идентификатору. Доступно только пользователям с ролями **editor** или **admin**.

---

## Request

**Headers**

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Path Parameters**

- `id` (uuid) – уникальный идентификатор проекта.

**Body Parameters (JSON)**

- `title` (string) – новое название проекта  
- `description` (string) – новое описание проекта  

**Пример запроса:**

```json
{
  "title": "string",
  "description": "string"
}

```

##Response 

200 OK

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "uploaded_by": "stringd",
  "created_at": "string",
  "updated_at": "string",
  "filename": "string",
  "file": "istring",
  "file_url": "string"
}

  400 Bad Request
  401 Unauthorized
  403 Forbidden
  500 Internal Server Error