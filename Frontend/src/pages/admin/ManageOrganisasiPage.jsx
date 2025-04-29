import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from 'react-bootstrap';
import TopNavigation from "../../components/navigation/TopNavigation";

const ManageOrganisasiPage = () => {
    return(
        <Container fluid className="p-0 bg-white">
            <TopNavigation activeTab="organisasi" />
        </Container>
    )
};

export default ManageOrganisasiPage;