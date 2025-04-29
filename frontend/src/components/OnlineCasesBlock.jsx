import React from 'react';
import './OnlineCasesBlock.scss';
import cakeImage from '../assets/iconitems/cake.png';
import clownboxImage from '../assets/iconitems/clownbox.png';
import eggImage from '../assets/iconitems/egg.png';
import ringImage from '../assets/iconitems/ring.png';
import topheadImage from '../assets/iconitems/tophead.png';

// Массив с кейсами (для примера Дане)
const caseImages = [
  eggImage,
  ringImage,
  cakeImage,
  clownboxImage,
  topheadImage,
  cakeImage,
  clownboxImage,
  cakeImage,
  clownboxImage,
  topheadImage,
  cakeImage,
  clownboxImage,

  ringImage,
  topheadImage,
  cakeImage,
  cakeImage,
];

const OnlineCasesBlock = () => {
  return (
    <div className="online-cases-block">
      <div className="online-block">
        <div className="online-number">3554</div> {/* Поменять на сервис потом!!! ЛЕХА!!! К САМОМУ СЕБЕ ОБРАЩАЮСЬ!!! */}
        <div className="online-text">Онлайн</div>
      </div>

      <div className="cases-container">
        {caseImages.map((image, index) => (
          <div className="case-wrapper" key={index}>
            <img src={image} alt={`case ${index}`} className="case-image" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineCasesBlock;
