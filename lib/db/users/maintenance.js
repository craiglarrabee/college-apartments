import {ExecuteQuery} from "../pool";

export const AddMaintenanceRequest = async (site, {user_id, tenant_first_name, tenant_last_name, username, email, apartment_number, room, request}) => {
    const query = `
        INSERT INTO maintenance_request
            (site, user_id, tenant_first_name, tenant_last_name, username, email, apartment_number, room, request, created_datetime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const params = [site, user_id, tenant_first_name, tenant_last_name, username, email, apartment_number, room, request];
    const [result] = await ExecuteQuery(query, params);
    return result?.insertId;
};

export const GetOpenMaintenanceRequests = async (site) => {
    const query = `
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
               DATE_FORMAT(created_datetime, '%m/%d/%Y') as created_datetime
        FROM maintenance_request
        WHERE site = ?
          AND closed_datetime IS NULL
        ORDER BY created_datetime DESC
    `;
    const [rows] = await ExecuteQuery(query, [site]);
    return rows || [];
};

export const GetClosedMaintenanceRequests = async (site) => {
    const query = `
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
               DATE_FORMAT(created_datetime, '%m/%d/%Y') as created_datetime,
               DATE_FORMAT(closed_datetime, '%m/%d/%Y') as closed_datetime
        FROM maintenance_request
        WHERE site = ?
          AND closed_datetime IS NOT NULL
        ORDER BY closed_datetime DESC
    `;
    const [rows] = await ExecuteQuery(query, [site]);
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
