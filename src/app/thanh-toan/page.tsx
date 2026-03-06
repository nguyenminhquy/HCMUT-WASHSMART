import { auth } from "@/auth";
import { PaymentFormVi } from "@/components/site/payment-form-vi";
import { resolveCustomerPhone } from "@/lib/current-customer";
import { prisma } from "@/lib/prisma";

type ThanhToanPageProps = {
  searchParams?: {
    bookingId?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function ThanhToanPage({ searchParams }: ThanhToanPageProps) {
  const bookingId = searchParams?.bookingId?.trim();
  if (!bookingId) {
    return <PaymentFormVi />;
  }

  const session = await auth();
  const customer = await resolveCustomerPhone(session?.user);
  if (!customer) {
    return <PaymentFormVi />;
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      phone: customer.phone
    },
    select: {
      id: true,
      bookingCode: true,
      startTime: true,
      status: true,
      branch: {
        select: {
          name: true
        }
      },
      service: {
        select: {
          name: true,
          price: true
        }
      }
    }
  });

  if (!booking) {
    return <PaymentFormVi />;
  }

  return (
    <PaymentFormVi
      booking={{
        id: booking.id,
        bookingCode: booking.bookingCode,
        branchName: booking.branch.name,
        serviceName: booking.service.name,
        amount: booking.service.price,
        startTime: booking.startTime.toISOString(),
        status: booking.status
      }}
    />
  );
}
