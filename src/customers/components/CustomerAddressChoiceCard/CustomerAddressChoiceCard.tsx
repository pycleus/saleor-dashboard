// @ts-strict-ignore
import AddressFormatter from "@dashboard/components/AddressFormatter";
import { DashboardCard } from "@dashboard/components/Card";
import { AddressFragment } from "@dashboard/graphql";
import { commonMessages } from "@dashboard/intl";
import { Typography } from "@material-ui/core";
import { EditIcon } from "@saleor/macaw-ui";
import clsx from "clsx";
import React from "react";
import { useIntl } from "react-intl";

import { useStyles } from "./styles";

export interface CustomerAddressChoiceCardProps {
  address: AddressFragment;
  selected?: boolean;
  editable?: boolean;
  onSelect?: () => void;
  onEditClick?: () => void;
}

const CustomerAddressChoiceCard: React.FC<CustomerAddressChoiceCardProps> = props => {
  const { address, selected, editable, onSelect, onEditClick } = props;
  const classes = useStyles(props);
  const intl = useIntl();

  return (
    <DashboardCard
      className={clsx(classes.card, {
        [classes.cardSelected]: selected,
        [classes.selectableCard]: !editable && !selected,
      })}
      onClick={onSelect}
    >
      <DashboardCard.Content className={classes.cardContent}>
        <AddressFormatter address={address} />
        {editable && (
          <div onClick={onEditClick}>
            <EditIcon className={classes.editIcon} />
          </div>
        )}
        {selected && (
          <Typography color="primary" className={classes.selectedLabel}>
            {intl.formatMessage(commonMessages.selected)}
          </Typography>
        )}
      </DashboardCard.Content>
    </DashboardCard>
  );
};

CustomerAddressChoiceCard.displayName = "CustomerAddressChoiceCard";
export default CustomerAddressChoiceCard;
