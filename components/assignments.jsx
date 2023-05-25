import {Table} from "react-bootstrap";
import React from "react";
import classNames from "classnames";

export const UserApartment = ({data}) => {
    return (
        <>
            <div style={{justifyContent: "center", display: "grid"}} className={classNames("h3")}>{`Apartment ${data[0].apartment_number}`}</div>
            <Table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Cell Phone</th>
                    <th>Home Phone</th>
                    <th>Email</th>
                </tr>
                </thead>
                <tbody>
                {data.map(row => (<tr>
                    <td>{row.name}</td>
                    <td>{row.cell_phone}</td>
                    <td>{row.home_phone}</td>
                    <td>{row.email}</td>
                </tr>))}
                </tbody>
            </Table>
        </>
    );
};