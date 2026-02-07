import classNames from "classnames";
import "./Capability.css";

type PhoneProps = {
  isLoaded: boolean;
  imageUrl?: string;
};

export const Phone = ({ isLoaded, imageUrl }: PhoneProps) => {
  return (
    <div
      className={classNames(
        "capability__phone",
        isLoaded && "capability__phone--loaded",
      )}
    >
      <div className="capability__phone-placeholder" />
    </div>
  );
};
