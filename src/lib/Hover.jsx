import { useState } from "react";

/**
 * Riproduce l'attributo `style-hover` dei file .dc.html originali:
 * unisce `hoverStyle` a `style` mentre il puntatore è sull'elemento.
 * `as` può essere "a", "button", il componente Link di react-router, ecc.
 */
export default function Hover({ as: Tag = "div", style, hoverStyle, ...rest }) {
  const [hover, setHover] = useState(false);
  return (
    <Tag
      {...rest}
      style={{ ...style, ...(hover ? hoverStyle : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    />
  );
}
