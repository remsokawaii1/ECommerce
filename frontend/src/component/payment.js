import GHeader from "./header";
import {Container, Row, Col, Form, Button, ListGroup} from 'react-bootstrap'
import '../asset/css/payment.css'
import axios from 'axios';
import React, { useState, useEffect, useRef} from "react";
import {TextField } from "@mui/material";
// import { useNavigate } from "react-router-dom";
import Footer from './footer';

const initialFValues = {
    name: '',
    phone: '',
    email: '',
    address: '',
    ward: '',
    dist: '',
    province: '',
}

const feeValues = {
    from_district_id:1453,
    service_id:53320,
    service_type_id:null,
    to_district_id:0,
    to_ward_code:"0",
    height:50,
    lengt:20,
    weight:200,
    width:20,
    insurance_value:10000,
    coupon: null
}

function Bill(props) {
    const { method, values, shipFee } = props;
    const listItem = {
        1: {
            name: 'Sunflower',
            price: 1000,
            size: 'large',
            amount: 1
        },
        2: {
            name: 'Rose',
            price: 2000,
            size: 'medium',
            amount: 2
        }
    }
    console.log(shipFee+total)
    const onPayment = (e) => {
        axios
            .post('http://localhost:5000/momo', {
              amount: total + shipFee
          })
            .then((res) => {
                // navigate(res.data);
                window.location.replace(res.data);
            });
        // console.log(values)
        for (const i in values){    
            // console.log(i + '=' + values[i] + ';' + expires + ";path=/complete";)
            const d = new Date();
            d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toUTCString();
            document.cookie = i + '=' + values[i] + ';' + expires + ";path=/complete";
        }
        
        //Create shipment on GHN
        //console.log("CONNECT TO SERVER");
        //console.log(values);
        axios
            .post('http://localhost:5000/ship', {
              name: values.name,
              phone: values.phone,
              address: values.address,
              ward: values.ward,
              dist: values.dist,
              province: values.province,
              itemList: Object.keys(listItem).map((key, index) => {return listItem[key];})
          })
            .then((res) => {
                console.log(res.data);
            });

    }

    var total = 0;
    for (var i in listItem){
        total+= listItem[i]['price']*listItem[i]['amount'];
    }

    return(
        
        <div className="bill-container">
            <Container>
                <Row className="mb-2 title">
                    <p>????N H??NG</p>
                </Row>
                <Row className="mb-2">
                    <hr/>
                </Row>
                
                <ListGroup className="cart-item">
                    {Object.keys(listItem).map(function(key, index) {
                        return(
                        <Row className='mb-4'>
                            <Row className='mb-3'>
                                <Col>{listItem[key]['name']}</Col>
                                <Col>{listItem[key]['price']} VND</Col>
                            </Row>
                            <Row className='mb-3'>
                                <Col>Size: {listItem[key]['size']}</Col>
                                <Col>x{listItem[key]['amount']}</Col>
                            </Row>  
                        </Row>
                        )
                        
                    })}
                      
                </ListGroup>

                <Row className="mb-2">
                    <hr style={{border: '1px dashed'}}/>
                </Row>

                <ListGroup className="fee">
                    <Row className='mb-2'>
                        <Col>????n h??ng</Col>
                        <Col>{total} VND</Col>
                    </Row>   
                    <Row className='mb-2'>
                        <Col>Gi???m</Col>
                        <Col>-0 VND</Col>
                    </Row>  
                    <Row className='mb-2'>
                        <Col>Ph?? v???n chuy???n</Col>
                        <Col>{shipFee} VND</Col>
                    </Row> 
                    <Row className='mb-2'>
                        <Col>Ph?? thanh to??n</Col>
                        <Col>0 VND</Col>
                    </Row>  
                </ListGroup>
                <Row className="mb-2">
                    <hr style={{border: '1px dashed'}}/>
                </Row>
                <Row className="mb-4 total">
                    <Col>T???ng C???ng</Col>
                    <Col>{total + shipFee} VND</Col>
                </Row>
                <Row className="mb-2 btn-row">
                    {
                        method === 'momo' ? 
                            <Button variant="none" type="submit" onClick={(e) => onPayment(e) } >
                                HO??N T???T ?????T H??NG
                            </Button>
                        :
                            <Button variant="none" type="submit">
                                HO??N T???T ?????T H??NG
                            </Button>
                    }
                    
                </Row>

            </Container>

        </div>
    )
}

export default function Payment(){

    const districtRef = useRef()
    const communeRef = useRef()

    
    const [values, setValues] = useState(initialFValues);

    const [provinces, setProvinces] = useState([])
    const [provinceSelect, setProvinceSelect] = useState(0)

    const [districts, setDistricts] = useState([])
    const [districtSelect, setDistrictSelect] = useState(0)

    const [communes, setCommunes] = useState([])
    const [communeSelect, setCommuneSelect] = useState(0)

    const [selectedValue, setSelectedValue] = useState('');
    const [shipeFee, setShipFee] = useState(0);
    

    useEffect(() => {
        const fetAPIProvince = async () => {
            const url = 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province';
            const tokenS = 'db9cc4ff-de42-11ec-ac64-422c37c6de1b'
            axios.get(url, { headers: { token: tokenS} }).then(res => {
      
                setProvinces(res.data.data)
            })
            if (provinceSelect !== 0) {
                var urlD = `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceSelect}`
                await axios.get(urlD, { headers: { token: tokenS} }).then(res => {
                    setDistricts(res.data.data)   
                })
            }
            if (districtSelect !== 0) {
                var urlC = `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtSelect}`
                await axios.get(urlC, { headers: {token: tokenS}}).then(res => {

                    setCommunes(res.data.data)
                    
                })
            }
        }
        const fetAPIService = async () => {
            const urlS = `https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services`
            const tokenS = 'db9cc4ff-de42-11ec-ac64-422c37c6de1b'
            const headerInfo = {
                'Content-Type': 'application/json',
                'token': tokenS
            }
            await axios.post(urlS, { 
                shop_id:113996,
                from_district: 1453,
                to_district: 1454
            }, {headers : headerInfo})
            .then(res => {
                console.log(res)
            })
        }
        fetAPIProvince()
        fetAPIService()
    }, [])

    const handleChangeProvince = async (e) => {
        values.province = e.target.value;
        const tokenS = 'db9cc4ff-de42-11ec-ac64-422c37c6de1b'
        setProvinceSelect(e.target.value)
        if (e.target.value === 0) {
            setDistricts([])
            setCommunes([])
        } else {
            await axios.get(`https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${e.target.value}`, { headers: { token: tokenS} }).then(res => {
                setDistricts(res.data.data)
            })
        }
        setDistrictSelect(0)
        setCommuneSelect(0)
    }

    const handleChangeDistrict = async (e) => {
        values.dist = e.target.value
        feeValues.to_district_id = parseInt(e.target.value) 
        const tokenS = 'db9cc4ff-de42-11ec-ac64-422c37c6de1b'
        
        setDistrictSelect(e.target.value)
        if (e.target.value === 0) {
            setCommunes([])
        } else {
            await axios.get(`https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${e.target.value}`, { headers: { token: tokenS} }).then(res => {
                setCommunes(res.data.data)
            })
        }
        setCommuneSelect(0)
    }

    const handleChange = e => {
        const { name, value } = e.target
        setValues({
            ...values,
            [name]: value
        })
        console.log(values)
    }

    const handleChangeCommune = async (e) => {
        values.ward = e.target.value;
        feeValues.to_ward_code = e.target.value
        setCommuneSelect(e.target.value)
        var tempSerID = []

        const urlS = `https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services`
        const tokenS = 'db9cc4ff-de42-11ec-ac64-422c37c6de1b'
        const headerInfo = {
            'Content-Type': 'application/json',
            'token': tokenS
        }
        await axios.post(urlS, { 
            shop_id:113996,
            from_district: 1453,
            to_district: feeValues.to_district_id
        }, {headers : headerInfo})
        .then(res => {
            tempSerID = res.data.data
            console.log(tempSerID)
        })



        const urlF = `https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`
        const headerInfoF = {
            'Content-Type': 'application/json',
            'token': tokenS,
            'shop_id': 113996
        }

        
        await axios.post(urlF, { 
            from_district_id:1453,
            service_id:tempSerID[0]['service_id'],
            service_type_id:null,
            to_district_id:feeValues.to_district_id,
            to_ward_code:feeValues.to_ward_code,
            height:50,
            lengt:20,
            weight:200,
            width:20,
            insurance_value:10000,
            coupon: null
        }, {headers : headerInfoF})
        .then(res => {
            setShipFee(res.data.data.total)
        })
        .catch(err => {
            if (err.response.data.code == 400){
                alert("Hi???n t???i ch??a c?? d???ch v??? giao h??ng ?????n khu v???c n??y, mong qu?? kh??ch th??ng c???m")
            }
            else {
                alert("Undefined Error")
            }
        })

    }

    
    const handleChangeMethoPay = (e) => {
        setSelectedValue(e.target.value);
    }

    // const controlProps = (item) => ({
    //     checked: selectedValue === item,
    //     onChange: handleChangeMethoPay,
    //     value: item,
    //     name: 'color-radio-button-demo',
    //     inputProps: { 'aria-label': item },
    // });

    return(
        <div>
            <div className="header">
            <GHeader/>
            </div>
            <Container>
                <Row>
                    <Col className = 'left-side' xs={6}>
                    <div className="payment-container">
                        <Container>
                            <Row>
                                <Col className="left-side">
                                    <Form>
                                        <Row className="form-label mb-3">
                                            <p>TH??NG TIN GIAO H??NG</p>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} controlId="formGridEmail">
                                                <TextField
                                                    label="H??? t??n"
                                                    id="outlined-basic"
                                                    name="name"
                                                    variant="outlined"
                                                    size="medium"
                                                    value={values.name}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    placeholder='Nguy???n V??n A'
                                                    handleChange
                                                />
                                            </Form.Group>
                                        </Row>

                                        <Form.Group className="mb-3" controlId="formGridPassword">
                                            <TextField
                                                label="S??? ??i???n tho???i"
                                                id="outlined-basic"
                                                name="phone"
                                                variant="outlined"
                                                size="medium"
                                                value={values.phone}
                                                onChange={handleChange}
                                                fullWidth
                                                placeholder='0999999999'
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="formGridAddress1">
                                            <TextField
                                                label="Email"
                                                id="outlined-basic"
                                                name="email"
                                                variant="outlined"
                                                size="medium"
                                                value={values.email}
                                                onChange={handleChange}
                                                fullWidth
                                                placeholder='abc@gmail.com'
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="formGridAddress2">
                                            <TextField
                                                label="?????a ch???"
                                                id="outlined-basic"
                                                name="address"
                                                variant="outlined"
                                                size="medium"
                                                value={values.address}
                                                onChange={handleChange}
                                                fullWidth
                                                placeholder='43 QL91 (S??? nh??)'
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="formGridState">
                                            <TextField
                                                fullWidth
                                                label="T???nh/TP"
                                                name="province"
                                                required
                                                size='medium'
                                                variant="outlined"
                                                select
                                                value={provinceSelect}
                                                onChange={handleChangeProvince}
                                                defaultValue={"0"}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="0">
                                                    --Ch???n T???nh/TP--
                                                </option>
                                                {provinces.map((province, index) => (
                                                    <option key={index} value={province.ProvinceID}>
                                                        {province.ProvinceName}
                                                    </option>
                                                ))}

                                            </TextField>
                                        </Form.Group>

                                        <Row className="mb-3">
                                            <Form.Group as={Col} controlId="formGridState">
                                            <TextField
                                                fullWidth
                                                label="Qu???n/Huy???n"
                                                name="district"
                                                required
                                                size='medium'
                                                variant="outlined"
                                                select
                                                value={districtSelect}
                                                ref={districtRef}
                                                onChange={handleChangeDistrict}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="0">
                                                    --Ch???n Qu???n/Huy???n--
                                                </option>
                                                {districts.map((district, index) => (
                                                    <option key={index} value={district.DistrictID}>
                                                        {district.DistrictName}
                                                    </option>
                                                ))}
                                            </TextField>
                                            </Form.Group>
                                            <Form.Group as={Col} controlId="formGridState">
                                            <TextField
                                                fullWidth
                                                label="X??/Ph?????ng"
                                                name="commune"
                                                required
                                                size='medium'
                                                variant="outlined"
                                                select
                                                value={communeSelect}
                                                onChange={handleChangeCommune}
                                                ref={communeRef}
                                                SelectProps={{ native: true }}
                                            >
                                                <option value="0">
                                                    --Ch???n X??/Ph?????ng--
                                                </option>
                                                {communes.map((commune, index) => (
                                                    <option key={index} value={commune.WardCode}>
                                                        {commune.WardName}
                                                    </option>
                                                ))}
                                            </TextField>
                                            </Form.Group>
                                        </Row>

                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <div >
                        <Container className="delivery">
                            <Col classname = 'left-side'>
                            <Form>
                                <Row className="form-label mb-1">
                                    <p>PH????NG TH???C GIAO H??NG</p>
                                </Row>
                                <Form.Check 
                                    type= 'checkbox'
                                    id= 'default-checkbox'
                                    label = 'T???c ????? ti??u chu???n (t??? 2-5 ng??y l??m vi???c)'
                                />
                                
                            </Form>
                            </Col>
                            <Col classname = 'right-side'>
                                
                            </Col>
                        </Container>
                    </div>
                    <div>
                        <Container className="payment-method">
                            <Col classname = 'left-side'>
                            <Form>
                                <Row className="form-label mb-1">
                                    <p>PH????NG TH???C THANH TO??N</p>
                                </Row>
                                
                                {['radio'].map((type) => (
                                <div key={`inline-${type}`} className="mb-3">
                                    <Form.Check
                                    label="Thanh to??n tr???c ti???p khi nh???n h??ng"
                                    name="group1"
                                    value = "paypal"
                                    type={type}
                                    id={`inline-${type}-1`}
                                    className = 'mb-2'
                                    onChange={handleChangeMethoPay}
                                    />
                                    <Form.Check
                                    label="Thanh to??n b???ng th??? qu???c t??? ho???c n???i ?????a (ATM)"
                                    name="group1"
                                    value="paypal"
                                    type={type}
                                    id={`inline-${type}-2`}
                                    className = 'mb-2'
                                    onChange={handleChangeMethoPay}
                                    />
                                    <Form.Check
                                    label="Thanh to??n b???ng v?? Momo"
                                    name="group1"
                                    value="momo"
                                    type={type}
                                    id={`inline-${type}-3`}
                                    className = 'mb-2'
                                    onChange={handleChangeMethoPay}
                                    />
                                </div>
                                ))}
                                
                            </Form>
                            </Col>
                            <Col classname = 'right-side'>
                                
                            </Col>
                        </Container>
                    </div>
                    </Col>
                    <Col xs={1}></Col>
                    <Col className = 'right-side' xs={5}>
                        <Bill method={selectedValue} values = {values} shipFee = {shipeFee}/>
                    </Col>
                </Row>
            
            </Container>
            <Footer/>
            

        </div>
    )
}
