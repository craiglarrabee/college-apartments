import {ExecuteQuery} from "../pool";

export const AddMaintenanceRequest = async (site, {user_id, tenant_first_name, tenant_last_name, username, email, apartment_number, room, request, semester}) => {
    const query = `
        INSERT INTO maintenance_request
            (site, user_id, tenant_first_name, tenant_last_name, username, email, apartment_number, room, request, semester, created_datetime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [site, user_id, tenant_first_name, tenant_last_name, username, email, apartment_number, room, request, semester];
    const [result] = await ExecuteQuery(query, params);
    return result?.insertId;
};

export const GetOpenMaintenanceRequests = async (site, semester) => {
    let query = `
        SELECT id,
               site,
               user_id,
               CONCAT(tenant_first_name, ' ', tenant_last_name) AS tenant_name,
               tenant_first_name,
               tenant_last_name,
               username,
               email,
               apartment_number,
               room,
               request,
               semester,
               DATE_FORMAT(created_datetime, '%m/%d/%Y') as created_datetime
        FROM maintenance_request
        WHERE site = ?
          AND closed_datetime IS NULL
    `;
    const params = [site];
    if (semester) {
        query += " AND semester = ? ";
        params.push(semester);
    }
    query += " ORDER BY created_datetime DESC";
    const [rows] = await ExecuteQuery(query, params);
    return rows || [];
};

export const GetClosedMaintenanceRequests = async (site, semester) => {
    let query = `
        SELECT id,
               site,
               user_id,
               CONCAT(tenant_first_name, ' ', tenant_last_name) AS tenant_name,
               tenant_first_name,
               tenant_last_name,
               username,
               email,
               apartment_number,
               room,
               request,
               semester,
               DATE_FORMAT(created_datetime, '%m/%d/%Y') as created_datetime,
               DATE_FORMAT(closed_datetime, '%m/%d/%Y') as closed_datetime
        FROM maintenance_request
        WHERE site = ?
          AND closed_datetime IS NOT NULL
    `;
    const params = [site];
    if (semester) {
        query += " AND semester = ? ";
        params.push(semester);
    }
    query += " ORDER BY closed_datetime DESC";
    const [rows] = await ExecuteQuery(query, params);
    return rows || [];
};

export const GetUserMaintenanceRequests = async (site, userId) => {
    const query = `
        SELECT id,
               site,
               user_id,
               apartment_number,
               room,
               request,
               DATE_FORMAT(created_datetime, '%m/%d/%Y') as created_datetime,
               DATE_FORMAT(closed_datetime, '%m/%d/%Y') as closed_datetime,
               closed_comments
        FROM maintenance_request
        WHERE site = ?
          AND user_id = ?
        ORDER BY created_datetime DESC
    `;
    const [rows] = await ExecuteQuery(query, [site, userId]);
    return rows || [];
};

export const CloseMaintenanceRequest = async (id, comments) => {
    const query = `
        UPDATE maintenance_request
        SET closed_datetime = NOW(),
            closed_comments = ?
        WHERE id = ?
    `;
    await ExecuteQuery(query, [comments || null, id]);
};

export const GetAllMaintenanceSemesters = async (site) => {
    const query = `
        SELECT DISTINCT semester
        FROM maintenance_request
        WHERE site = ? AND semester IS NOT NULL AND semester != ''
        ORDER BY SUBSTR(semester, LOCATE(' ', semester) + 1) DESC, 
                 CASE 
                     WHEN semester LIKE 'Fall%' THEN 3 
                     WHEN semester LIKE 'Summer%' THEN 2 
                     WHEN semester LIKE 'Spring%' THEN 1 
                 END DESC
    `;
    const [rows] = await ExecuteQuery(query, [site]);
    return rows || [];
};
