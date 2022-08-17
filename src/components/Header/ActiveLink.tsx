import { ReactElement, cloneElement } from "react";
import { useRouter } from 'next/router';
import Link, { LinkProps } from "next/link";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
}

import styles from './styles.module.scss';

export function ActiveLink({ children,...rest }: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === rest.href && styles.active;

  return (
    <Link {...rest}>
      {cloneElement(children, {
        className 
      })}
    </Link>
  )
}
