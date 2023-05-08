import { OrderAddresses } from '#components/OrderAddresses'
import { OrderCustomer } from '#components/OrderCustomer'
import { OrderDetailsContextMenu } from '#components/OrderDetailsContextMenu'
import { OrderPayment } from '#components/OrderPayment'
import { OrderShipments } from '#components/OrderShipments'
import { OrderSteps } from '#components/OrderSteps'
import { OrderSummary } from '#components/OrderSummary'
import { OrderTimeline } from '#components/OrderTimeline'
import { ScrollToTop } from '#components/ScrollToTop'
import { OrderContext } from '#contexts/OrderContext'
import { appRoutes } from '#data/routes'
import { isMock, makeOrder } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  formatDate,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function OrderDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const [order, setOrder] = useState<Order>(makeOrder())
  const [reloadOrder, refreshOrder] = useState<number>(Math.random())

  const isLoading = useMemo(() => isMock(order), [order])

  const orderId = params?.orderId

  useEffect(
    function fetchOrder() {
      if (sdkClient != null && orderId !== undefined) {
        void sdkClient.orders
          .retrieve(orderId, {
            include: [
              'market',
              'customer',
              'line_items',
              'shipping_address',
              'billing_address',
              'shipments',

              // Timeline
              'transactions',
              'payment_method',
              'payment_source',
              'attachments'
            ]
          })
          .then((response) => {
            setOrder(response)
          })
      }
    },
    [sdkClient, orderId, reloadOrder]
  )

  if (orderId === undefined || !canUser('read', 'orders')) {
    return (
      <PageLayout
        title='Orders'
        onGoBack={() => {
          setLocation(appRoutes.filters.makePath())
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.filters.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const pageTitle = `${order.market?.name} #${order.number}`

  return (
    <OrderContext.Provider
      value={{
        order,
        setOrder,
        refreshOrder: () => {
          refreshOrder(Math.random())
        }
      }}
    >
      <PageLayout
        mode={mode}
        actionButton={<OrderDetailsContextMenu order={order} />}
        title={
          <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
        }
        description={
          <SkeletonTemplate isLoading={isLoading}>{`Placed on ${formatDate({
            isoDate: order.placed_at ?? '',
            timezone: user?.timezone,
            format: 'full'
          })}`}</SkeletonTemplate>
        }
        onGoBack={() => {
          setLocation(appRoutes.listHistory.makePath())
        }}
      >
        <ScrollToTop />
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer bottom='4'>
            <OrderSteps order={order} />
            <Spacer top='14'>
              <OrderSummary order={order} />
            </Spacer>
            <Spacer top='14'>
              <OrderCustomer order={order} />
            </Spacer>
            <Spacer top='14'>
              <OrderPayment order={order} />
            </Spacer>
            <Spacer top='14'>
              <OrderAddresses order={order} />
            </Spacer>
            <Spacer top='14'>
              <OrderShipments order={order} />
            </Spacer>
            <Spacer top='14'>
              <OrderTimeline order={order} />
            </Spacer>
          </Spacer>
        </SkeletonTemplate>
      </PageLayout>
    </OrderContext.Provider>
  )
}
