import {Col, Form, FormCheck} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";

export const BulkEmailOptions = ({tenants, apartments, register = () => {}, errors}) => {

    let [allChecked, setAllChecked] = useState(false);
    let [maleChecked, setMaleChecked] = useState(false);
    let [femaleChecked, setFemaleChecked] = useState(false);
    let [selectedTenantsChecked, setSelectedTenantsChecked] = useState(false);
    let [selectedApartmentsChecked, setSelectedApartmentsChecked] = useState(false);
    let [selectedTenants, setSelectedTenants] = useState([]);
    let [selectedApartments, setSelectedApartments] = useState([]);

    const changeSelected = (callback) => {
        setAllChecked(false);
        setMaleChecked(false);
        setFemaleChecked(false);
        setSelectedTenantsChecked(false);
        setSelectedApartmentsChecked(false);
        callback();
    };

    const handleSelectedTenantsChange = (e) => {
        setSelectedTenants([...e.target.selectedOptions].map(option => option.value));
    };


    const handleSelectedApartmentsChange = (e) => {
        setSelectedApartments([...e.target.selectedOptions].map(option => option.value));
    };

    return (
        <>
            <div onClick={() => changeSelected(() => setAllChecked(true))} >
                <FormCheck className="mb-3" style={{display: "block"}} {...register(`recipients`, {
                    required: true,
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" inline value={"All"} id={"All"} label="All Tenants" checked={allChecked} />
            </div>
            <div onClick={() => changeSelected(() => setFemaleChecked(true))} >
                <FormCheck className="mb-3" style={{display: "block"}} {...register(`recipients`, {
                    required: true,
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" inline value={"Female"} id={"Female"} label="Female Tenants" checked={femaleChecked} />
            </div>
            <div onClick={() => changeSelected(() => setMaleChecked(true))} >
                <FormCheck className="mb-3" style={{display: "block"}} {...register(`recipients`, {
                    required: true,
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" inline value={"Male"} id={"Male"} label="Male Tenants" checked={maleChecked} />
            </div>
            <div onClick={() => changeSelected(() => setSelectedTenantsChecked(true))} >
                <FormCheck className="mb-3" style={{display: "block"}} {...register(`recipients`, {
                    required: true,
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" inline value={"Tenants"} id={"Tenants"} label="Choose Tenants from list" checked={selectedTenantsChecked} />
            </div>
            <Form.Group as={Col} xs={4} className="mb-3" controlId="selected_recipients" hidden={!selectedTenantsChecked} >
                <Form.Label visuallyHidden={true}>Recipient List</Form.Label>
                <Form.Select multiple value={selectedTenants} htmlSize={tenants.length < 20 ? tenants.length : 20}
                            className={errors && errors.selected_recipients && classNames("border-danger")}
                             {...register("selected_recipients")} onChange={handleSelectedTenantsChange}>
                    {tenants.map(tenant => <option value={tenant.user_id} key={`${tenant.semester}_${tenant.user_id}`} >{tenant.name}</option> )}
                </Form.Select>
                {errors && errors.selected_recipients && <Form.Text className={classNames("text-danger")}>{errors && errors.selected_recipients.message}</Form.Text>}
            </Form.Group>
            <div onClick={() => changeSelected(() => setSelectedApartmentsChecked(true))} >
                <Form.Check className="mb-3" style={{display: "block"}} {...register(`recipients`, {
                    required: true,
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" inline value={"Apartments"} id={"Apartments"} label="All Tenants of selected apartments" checked={selectedApartmentsChecked} />
            </div>
            <Form.Group as={Col} xs={4} className="mb-3" controlId="selected_apartments" hidden={!selectedApartmentsChecked} >
                <Form.Label visuallyHidden={true}>Recipient List</Form.Label>
                <Form.Select multiple value={selectedApartments} htmlSize={apartments.length < 20 ? apartments.length : 20}
                             className={errors && errors.selected_apartments && classNames("border-danger")}
                             {...register("selected_apartments")} onChange={handleSelectedApartmentsChange}>
                    {apartments.map(apartment => <option value={apartment.apartment_number} key={`${apartment.semester}_${apartment.apartment_number}`} >{apartment.apartment_number}</option> )}
                </Form.Select>
                {errors && errors.selected_apartments && <Form.Text className={classNames("text-danger")}>{errors && errors.selected_apartments.message}</Form.Text>}
            </Form.Group>
        </>
    )
};
