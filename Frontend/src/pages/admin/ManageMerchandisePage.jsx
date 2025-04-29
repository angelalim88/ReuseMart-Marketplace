import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from 'react-bootstrap';
import TopNavigation from "../../components/navigation/TopNavigation";

const ManageMerchandisePage = () => {
    return(
        <Container fluid className="p-0 bg-white">
            <TopNavigation activeTab="merchandise" />
        </Container>
    )
};

export default ManageMerchandisePage;