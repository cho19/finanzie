import React from 'react';
import { Card, CardContent, Typography, CardActions, Box, makeStyles } from '@material-ui/core';
import { formatMoney } from 'accounting';
import { capitalize } from 'lodash';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';

import {
  MyAccountsQuery,
  DeleteDebitAccountMutation,
  DeleteDebitAccountMutationVariables,
} from '../../@types/graphql';
import EnhancedIconButton from '../ui/EnhancedIconButton';
import { deleteDebitAccountMutation, myAccountsQuery } from '../../graphql/account';
import { myTransactionsQuery } from '../../graphql/transaction';
import { useBreakpoint } from '../../hooks/utils/useBreakpoint';

interface Props {
  debitAccount: MyAccountsQuery['accounts'][number];
}

const useStyles = makeStyles((theme) => ({
  balance: { marginTop: theme.spacing(2) },
  type: { margin: theme.spacing(0, 0, 1, 1), lineHeight: theme.typography.body2.lineHeight },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  buttons: { display: 'flex', '& > *:not(:last-child)': { marginRight: theme.spacing(1) } },
}));

const DebitAccountCard: React.FC<Props> = ({ debitAccount: { id, name, bank, balance, type } }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useBreakpoint({ layout: 'xs' });
  const [deleteAccount, { loading: deleteLoading }] = useMutation<
    DeleteDebitAccountMutation,
    DeleteDebitAccountMutationVariables
  >(deleteDebitAccountMutation, {
    refetchQueries: [{ query: myAccountsQuery }, { query: myTransactionsQuery }],
  });

  const handleDelete = async () => {
    try {
      await deleteAccount({ variables: { id } });
      enqueueSnackbar('Account deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  const iconFontSize = isMobile ? 'small' : 'default';
  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {name} / {bank}
          </Typography>
          <Typography className={classes.balance} variant="h2">
            {formatMoney(balance)}
          </Typography>
        </CardContent>
        <CardActions className={classes.actions}>
          <Typography className={classes.type} variant="overline" color="textSecondary">
            {capitalize(type)}
          </Typography>
          <Box className={classes.buttons}>
            <EnhancedIconButton contained disabled color="success">
              <VisibilityIcon fontSize={iconFontSize} />
            </EnhancedIconButton>
            <EnhancedIconButton contained disabled color="info">
              <EditIcon fontSize={iconFontSize} />
            </EnhancedIconButton>
            <EnhancedIconButton
              contained
              data-testid={`deleteAccount${id}`}
              disabled={deleteLoading}
              onClick={handleDelete}
              color="error"
            >
              <DeleteIcon fontSize={iconFontSize} />
            </EnhancedIconButton>
          </Box>
        </CardActions>
      </Card>
    </>
  );
};

export default DebitAccountCard;
