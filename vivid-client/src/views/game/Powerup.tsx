import React from 'react';
import './Powerup.css';

const powerupIconMap: any = {
  sticky: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="1em" height="1em"><path fill="currentColor" d="M15,3C8.925,3,4,7.925,4,14v8c0,1.105,0.895,2,2,2s2-0.895,2-2v-3c0-0.552,0.448-1,1-1s1,0.448,1,1v7c0,1.105,0.895,2,2,2 s2-0.895,2-2v-5c0-0.552,0.448-1,1-1s1,0.448,1,1v2c0,1.105,0.895,2,2,2s2-0.895,2-2v-6c0-0.552,0.448-1,1-1s1,0.448,1,1v8 c0,1.105,0.895,2,2,2s2-0.895,2-2V14C26,7.925,21.075,3,15,3z"></path></svg>`,
  ball: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 23 23"><path d="M9.845.669A11.432,11.432,0,0,0,4.178,3.164L7.767,6.753A10.328,10.328,0,0,0,9.845.669ZM11.5,10.486l7.322-7.322a11.461,11.461,0,0,0-6.747-2.6A12.514,12.514,0,0,1,9.353,8.339ZM2.6,4.741A11.432,11.432,0,0,0,.107,10.407,10.317,10.317,0,0,0,6.191,8.33Zm12.622,9.469A12.549,12.549,0,0,1,23,11.488a11.461,11.461,0,0,0-2.6-6.747l-7.322,7.322,2.147,2.147Zm-3.724-.57L4.178,20.961a11.492,11.492,0,0,0,6.747,2.6,12.549,12.549,0,0,1,2.722-7.776Zm8.9,5.745a11.432,11.432,0,0,0,2.495-5.667A10.369,10.369,0,0,0,16.809,15.8ZM7.776,9.916A12.486,12.486,0,0,1,0,12.638a11.461,11.461,0,0,0,2.6,6.747l7.322-7.322Zm5.379,13.54a11.432,11.432,0,0,0,5.667-2.495l-3.589-3.589A10.38,10.38,0,0,0,13.155,23.456Z" fill="currentColor"/></svg>`,
  shield: `<svg aria-hidden="true" width="1em" height="1em" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"></path></svg>`,

  plus: `<svg aria-hidden="true" width="1em" height="1em" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg>`,
  rocket: `<svg aria-hidden="true" width="1em" height="1em" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z"></path></svg>`,
};

export const addons = ['bigpad', 'bigball', 'fastball', 'fastpad', 'sticky'];

export const powerupMap: any = {
  sticky: {
    display: 'Sticky pad',
    mainIcon: 'sticky',
    extraClasses: 'rotate pink',
    subIcon: null,
  },
  fastball: {
    display: 'Ball speed up',
    mainIcon: 'ball',
    extraClasses: 'yellow',
    subIcon: 'rocket',
  },
  bigball: {
    display: 'Ball size up',
    mainIcon: 'ball',
    extraClasses: 'yellow',
    subIcon: 'plus',
  },
  fastpad: {
    display: 'Pad speed up',
    mainIcon: 'shield',
    extraClasses: 'cyan',
    subIcon: 'rocket',
  },
  bigpad: {
    display: 'Pad size up',
    mainIcon: 'shield',
    extraClasses: 'cyan',
    subIcon: 'plus',
  },
};

function ProgressBar({ current, max }: { current: number; max: number }) {
  const percentage = `${Math.floor((current / max) * 100)}%`;

  return (
    <div className="progressbar">
      <div
        className="progressbar-inside"
        style={{
          width: percentage,
        }}
      />
    </div>
  );
}

const PowerupIcon = React.memo(function PowerupIcon(props: {
  addon: string | null | undefined;
}) {
  if (!props.addon) return null;
  const data = powerupMap[props.addon];
  if (!data) return null;
  return (
    <div className="powerup-center">
      <div className={`powerup-icon-wrapper ${data.extraClasses}`}>
        <div
          dangerouslySetInnerHTML={{ __html: powerupIconMap[data.mainIcon] }}
        />
        {data.subIcon ? (
          <div className="powerup-subicon">
            <div
              dangerouslySetInnerHTML={{ __html: powerupIconMap[data.subIcon] }}
            />
          </div>
        ) : null}
      </div>
      <p className="powerup-icon-text">{data.display}</p>
    </div>
  );
});

export function AddonData(props: {
  activatedTicks: number | undefined;
  activatedMax: number | undefined;
  currentAddon: string | undefined | null;
  countdown: number | undefined;
  show: boolean;
}) {
  if (
    !props.show ||
    props.activatedTicks == undefined ||
    props.activatedMax == undefined
  )
    return null;
  return (
    <div className="powerup-wrapper">
      {!props.currentAddon ? (
        <div className="powerup-center">
          <div className="powerup-icon-wrapper">
            <p className="powerup-countdown-text">{props.countdown}</p>
          </div>
          <p className="powerup-icon-text" />
        </div>
      ) : null}
      <PowerupIcon addon={props.currentAddon} />
      <ProgressBar current={props.activatedTicks} max={props.activatedMax} />
    </div>
  );
}

export function AddonList(props: { addons: string[] }) {
  return (
    <div className="addon-list">
      {props.addons.map((v) => (
        <span className="addon-list-item" key={v}>
          {powerupMap[v]?.display || 'unknown'}
        </span>
      ))}
    </div>
  );
}
