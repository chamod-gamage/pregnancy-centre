import { Carousel, Container } from "react-bootstrap";
import React, { FunctionComponent } from "react";

interface Props {
    bannerImgs: Array<string>;
    bannerHeader: string;
    bannerDesc: string;
}

const BannerCarousel: FunctionComponent<Props> = (props: Props) => {
    const bannerIntv = 1000 * 10;
    return (
        <div className="banner-carousel">
            <Container fluid>
                <Carousel controls={false} interval={bannerIntv} indicators={false} className="carousel" fade>
                    {props.bannerImgs.map((imgLink, index) => (
                        <Carousel.Item key={index}>
                            <img src={`${imgLink}`} />
                        </Carousel.Item>
                    ))}
                </Carousel>
            </Container>
            <div className="col-md-6 banner-carousel-info">
                <h1>{props.bannerHeader}</h1>
                <p>{props.bannerDesc}</p>
            </div>
        </div>
    );
};

export default BannerCarousel;
